import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  TextractClient,
  DetectDocumentTextCommand,
} from "@aws-sdk/client-textract";

export interface OdometerResult {
  mileage: number;
  confidence: number;
  rawText: string;
  boundingBox: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  detectionMethod: string;
}

export interface TextractBlock {
  Text?: string;
  Confidence?: number;
  Geometry?: {
    BoundingBox?: {
      Left?: number;
      Top?: number;
      Width?: number;
      Height?: number;
    };
  };
  BlockType?: string;
}

@Injectable()
export class AwsTextractService {
  private readonly logger = new Logger(AwsTextractService.name);
  private textract: TextractClient;

  constructor(private configService: ConfigService) {
    // Configure AWS v3 client
    this.textract = new TextractClient({
      region: this.configService.get("AWS_REGION", "us-east-1"),
      credentials: {
        accessKeyId: this.configService.get("AWS_ACCESS_KEY_ID"),
        secretAccessKey: this.configService.get("AWS_SECRET_ACCESS_KEY"),
      },
    });
  }

  /**
   * Extract odometer reading from image using AWS Textract
   */
  async extractOdometerReading(imageBuffer: Buffer): Promise<OdometerResult> {
    try {
      this.logger.log("Starting AWS Textract OCR processing");

      // Call AWS Textract v3
      const command = new DetectDocumentTextCommand({
        Document: {
          Bytes: imageBuffer,
        },
      });

      const textractResponse = await this.textract.send(command);

      this.logger.log(
        `Textract processed ${textractResponse.Blocks?.length || 0} blocks`
      );

      // Extract odometer reading using multiple detection methods
      const odometerResult = this.findOdometerReading(
        textractResponse.Blocks || []
      );

      if (!odometerResult) {
        throw new Error("No valid odometer reading found in image");
      }

      this.logger.log(
        `Odometer detected: ${odometerResult.mileage} (confidence: ${odometerResult.confidence}%)`
      );

      return odometerResult;
    } catch (error) {
      this.logger.error("AWS Textract OCR failed:", error);
      throw new Error(`OCR processing failed: ${error.message}`);
    }
  }

  /**
   * Find odometer reading using multiple detection strategies
   */
  private findOdometerReading(blocks: TextractBlock[]): OdometerResult | null {
    const wordBlocks = blocks.filter(
      (block) => block.BlockType === "WORD" && block.Text
    );

    this.logger.debug(`Processing ${wordBlocks.length} word blocks`);

    // Method 1: Pure number detection (5-7 digits)
    const pureNumbers = this.findPureNumbers(wordBlocks);
    if (pureNumbers.length > 0) {
      this.logger.debug(`Found ${pureNumbers.length} pure number candidates`);
      return this.selectBestOdometer(pureNumbers, "pure_number");
    }

    // Method 2: Look for numbers near "MILE", "KM", "ODO" labels
    const labeledNumbers = this.findLabeledNumbers(wordBlocks);
    if (labeledNumbers.length > 0) {
      this.logger.debug(
        `Found ${labeledNumbers.length} labeled number candidates`
      );
      return this.selectBestOdometer(labeledNumbers, "labeled_number");
    }

    // Method 3: Position-based detection (center/right area)
    const positionedNumbers = this.findPositionedNumbers(wordBlocks);
    if (positionedNumbers.length > 0) {
      this.logger.debug(
        `Found ${positionedNumbers.length} positioned number candidates`
      );
      return this.selectBestOdometer(positionedNumbers, "positioned_number");
    }

    // Method 4: Any number with high confidence
    const highConfidenceNumbers = this.findHighConfidenceNumbers(wordBlocks);
    if (highConfidenceNumbers.length > 0) {
      this.logger.debug(
        `Found ${highConfidenceNumbers.length} high confidence number candidates`
      );
      return this.selectBestOdometer(highConfidenceNumbers, "high_confidence");
    }

    return null;
  }

  /**
   * Find pure number patterns (5-7 digits)
   */
  private findPureNumbers(blocks: TextractBlock[]): TextractBlock[] {
    return blocks.filter((block) => {
      if (!block.Text || !block.Confidence) return false;
      const text = block.Text.replace(/[^\d]/g, "");
      return /^\d{5,7}$/.test(text) && block.Confidence > 85;
    });
  }

  /**
   * Find numbers near odometer-related labels
   */
  private findLabeledNumbers(blocks: TextractBlock[]): TextractBlock[] {
    const odometerLabels = ["MILE", "KM", "ODO", "ODOMETER", "TOTAL", "TRIP"];
    const labelBlocks = blocks.filter(
      (block) =>
        block.Text &&
        odometerLabels.some((label) =>
          block.Text!.toUpperCase().includes(label)
        )
    );

    return blocks.filter((block) => {
      if (!block.Text || !block.Confidence) return false;
      const text = block.Text.replace(/[^\d]/g, "");
      if (!/^\d{4,7}$/.test(text) || block.Confidence < 80) return false;

      // Check if number is near a label (within reasonable distance)
      return labelBlocks.some(
        (labelBlock) => this.isNearby(block, labelBlock, 0.1) // 10% of image width/height
      );
    });
  }

  /**
   * Find numbers in typical odometer positions (center/right area)
   */
  private findPositionedNumbers(blocks: TextractBlock[]): TextractBlock[] {
    return blocks.filter((block) => {
      if (!block.Text || !block.Confidence || !block.Geometry?.BoundingBox)
        return false;
      const text = block.Text.replace(/[^\d]/g, "");
      if (!/^\d{4,7}$/.test(text) || block.Confidence < 75) return false;

      const bbox = block.Geometry.BoundingBox;

      // Odometer typically in center-right area
      const isInOdometerArea =
        bbox.Left! > 0.3 &&
        bbox.Left! < 0.9 && // Right side
        bbox.Top! > 0.2 &&
        bbox.Top! < 0.8; // Center area

      return isInOdometerArea;
    });
  }

  /**
   * Find any numbers with very high confidence
   */
  private findHighConfidenceNumbers(blocks: TextractBlock[]): TextractBlock[] {
    return blocks.filter((block) => {
      if (!block.Text || !block.Confidence) return false;
      const text = block.Text.replace(/[^\d]/g, "");
      return /^\d{4,7}$/.test(text) && block.Confidence > 95;
    });
  }

  /**
   * Check if two blocks are nearby each other
   */
  private isNearby(
    block1: TextractBlock,
    block2: TextractBlock,
    threshold: number
  ): boolean {
    const bbox1 = block1.Geometry?.BoundingBox;
    const bbox2 = block2.Geometry?.BoundingBox;

    if (!bbox1 || !bbox2) return false;

    const distanceX = Math.abs((bbox1.Left || 0) - (bbox2.Left || 0));
    const distanceY = Math.abs((bbox1.Top || 0) - (bbox2.Top || 0));

    return distanceX < threshold && distanceY < threshold;
  }

  /**
   * Select the best odometer reading from candidates
   */
  private selectBestOdometer(
    candidates: TextractBlock[],
    method: string
  ): OdometerResult {
    // Sort by confidence, then by number length (prefer longer numbers)
    const sortedCandidates = candidates.sort((a, b) => {
      if (Math.abs((a.Confidence || 0) - (b.Confidence || 0)) > 5) {
        return (b.Confidence || 0) - (a.Confidence || 0);
      }
      return (b.Text?.length || 0) - (a.Text?.length || 0);
    });

    const bestCandidate = sortedCandidates[0];
    const mileage = parseInt((bestCandidate.Text || "").replace(/[^\d]/g, ""));

    return {
      mileage,
      confidence: bestCandidate.Confidence || 0,
      rawText: bestCandidate.Text || "",
      boundingBox: {
        left: bestCandidate.Geometry?.BoundingBox?.Left || 0,
        top: bestCandidate.Geometry?.BoundingBox?.Top || 0,
        width: bestCandidate.Geometry?.BoundingBox?.Width || 0,
        height: bestCandidate.Geometry?.BoundingBox?.Height || 0,
      },
      detectionMethod: method,
    };
  }

  /**
   * Validate odometer reading for reasonable values
   */
  private validateOdometerReading(mileage: number): boolean {
    // Typical odometer ranges: 0 to 999,999
    if (mileage < 0 || mileage > 999999) {
      return false;
    }

    // Check for suspicious patterns (all same digits, etc.)
    const mileageStr = mileage.toString();
    if (mileageStr.length >= 3) {
      const firstDigit = mileageStr[0];
      if (mileageStr.split("").every((digit) => digit === firstDigit)) {
        return false; // All same digits (e.g., 111111)
      }
    }

    return true;
  }

  /**
   * Get OCR processing statistics
   */
  async getProcessingStats(): Promise<{
    totalProcessed: number;
    successRate: number;
    averageConfidence: number;
  }> {
    // This would typically come from a database
    // For now, return mock stats
    return {
      totalProcessed: 0,
      successRate: 0,
      averageConfidence: 0,
    };
  }
}
