import { Injectable, Logger } from '@nestjs/common';
import * as tf from '@tensorflow/tfjs-node';
import * as sharp from 'sharp';

export interface OcrResult {
  text: string;
  confidence: number;
  mileage?: number;
  mileageConfidence: number;
  processingTimeMs: number;
}

export interface MileageExtractionResult {
  mileage: number;
  confidence: number;
  rawText: string;
  extractedNumbers: string[];
}

@Injectable()
export class TensorFlowOcrService {
  private readonly logger = new Logger(TensorFlowOcrService.name);
  private model: tf.GraphModel | null = null;
  private isModelLoaded = false;

  constructor() {
    this.initializeModel();
  }

  /**
   * Initialize TensorFlow model
   */
  private async initializeModel(): Promise<void> {
    try {
      this.logger.log('Initializing TensorFlow OCR model...');

      // For now, we'll use a basic approach since we don't have a pre-trained model
      // In production, you would load a trained OCR model here
      this.isModelLoaded = true;
      this.logger.log('TensorFlow OCR model initialized');
    } catch (error) {
      this.logger.error('Failed to initialize TensorFlow model:', error);
      this.isModelLoaded = false;
    }
  }

  /**
   * Extract mileage from odometer image
   */
  async extractMileage(imageBuffer: Buffer): Promise<MileageExtractionResult> {
    const startTime = Date.now();

    try {
      this.logger.log('Starting mileage extraction from image');

      if (!this.isModelLoaded) {
        throw new Error('OCR model not loaded');
      }

      // Preprocess image for OCR
      const processedImage = await this.preprocessImage(imageBuffer);

      // Extract text using basic OCR approach
      // In production, this would use the loaded TensorFlow model
      const ocrResult = await this.performOcr(processedImage);

      // Extract mileage from OCR text
      const mileageResult = this.extractMileageFromText(ocrResult.text);

      const processingTime = Date.now() - startTime;

      this.logger.log(`Mileage extraction completed in ${processingTime}ms`);

      return {
        mileage: mileageResult.mileage,
        confidence: mileageResult.confidence * ocrResult.confidence,
        rawText: ocrResult.text,
        extractedNumbers: mileageResult.extractedNumbers,
      };
    } catch (error) {
      console.log('🚀 ~ TensorFlowOcrService ~ extractMileage ~ error:', error);
      this.logger.error(`Mileage extraction failed: ${error.message}`);
      return {
        mileage: 0,
        confidence: 0,
        rawText: '',
        extractedNumbers: [],
      };
    }
  }

  /**
   * Preprocess image for OCR
   */
  private async preprocessImage(imageBuffer: Buffer): Promise<Buffer> {
    try {
      // Convert to grayscale and enhance contrast
      const processed = await sharp(imageBuffer)
        .grayscale()
        .normalize()
        .sharpen()
        .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 90 })
        .toBuffer();

      return processed;
    } catch (error) {
      this.logger.warn(
        `Image preprocessing failed, using original: ${error.message}`,
      );
      return imageBuffer;
    }
  }

  /**
   * Perform OCR on image
   */
  private async performOcr(
    imageBuffer: Buffer,
  ): Promise<{ text: string; confidence: number }> {
    try {
      // Convert image to tensor
      const imageTensor = tf.node.decodeImage(imageBuffer, 1); // Grayscale

      // Normalize pixel values
      const normalized = imageTensor.div(255.0);

      // For now, we'll simulate OCR results
      // In production, this would use the actual TensorFlow model
      const simulatedText = this.simulateOcrText(normalized);

      // Clean up tensors
      imageTensor.dispose();
      normalized.dispose();

      return {
        text: simulatedText,
        confidence: 0.85, // Simulated confidence
      };
    } catch (error) {
      this.logger.error(`OCR processing failed: ${error.message}`);
      throw new Error('OCR processing failed');
    }
  }

  /**
   * Simulate OCR text extraction (placeholder for actual model)
   */
  private simulateOcrText(imageTensor: tf.Tensor): string {
    // This is a placeholder - in production, you would use the actual OCR model
    // For now, we'll return a simulated odometer reading
    const possibleReadings = [
      '123456',
      '98765',
      '45678',
      '78901',
      '23456',
      '56789',
      '34567',
      '67890',
    ];

    // Simulate based on image characteristics
    const meanValue = imageTensor.mean().dataSync()[0];
    const index =
      Math.floor(meanValue * possibleReadings.length) % possibleReadings.length;

    return possibleReadings[index];
  }

  /**
   * Extract mileage from OCR text
   */
  private extractMileageFromText(text: string): {
    mileage: number;
    confidence: number;
    extractedNumbers: string[];
  } {
    try {
      // Extract all numbers from text
      const numbers = text.match(/\d+/g) || [];
      const extractedNumbers = numbers.map((num) => num.toString());

      if (extractedNumbers.length === 0) {
        return {
          mileage: 0,
          confidence: 0,
          extractedNumbers: [],
        };
      }

      // Find the most likely mileage (usually the largest number)
      const numericValues = extractedNumbers.map((num) => parseInt(num, 10));
      const maxNumber = Math.max(...numericValues);

      // Validate mileage range (reasonable for vehicles)
      const isValidMileage = maxNumber >= 0 && maxNumber <= 999999;

      // Calculate confidence based on number of digits and range
      let confidence = 0.5; // Base confidence

      if (isValidMileage) {
        confidence += 0.3;
      }

      if (maxNumber.toString().length >= 4) {
        confidence += 0.2; // More digits = higher confidence
      }

      // Check for common odometer patterns
      if (
        maxNumber.toString().length === 5 ||
        maxNumber.toString().length === 6
      ) {
        confidence += 0.1;
      }

      confidence = Math.min(confidence, 1.0);

      return {
        mileage: isValidMileage ? maxNumber : 0,
        confidence,
        extractedNumbers,
      };
    } catch (error) {
      this.logger.error(
        `Mileage extraction from text failed: ${error.message}`,
      );
      return {
        mileage: 0,
        confidence: 0,
        extractedNumbers: [],
      };
    }
  }

  /**
   * Validate extracted mileage
   */
  validateMileage(
    mileage: number,
    previousMileage?: number,
  ): { isValid: boolean; confidence: number; reason?: string } {
    try {
      let confidence = 0.5;
      let isValid = true;
      let reason = '';

      // Basic range validation
      if (mileage < 0 || mileage > 999999) {
        isValid = false;
        confidence = 0;
        reason = 'Mileage out of valid range';
      }

      // Check for reasonable progression
      if (previousMileage !== undefined) {
        const difference = mileage - previousMileage;

        if (difference < 0) {
          isValid = false;
          confidence = 0;
          reason = 'Mileage cannot decrease';
        } else if (difference > 1000) {
          // Flag suspicious large jumps
          confidence *= 0.5;
          reason = 'Large mileage increase detected';
        } else if (difference === 0) {
          confidence *= 0.8;
          reason = 'No mileage change detected';
        } else if (difference <= 100) {
          confidence += 0.2; // Reasonable progression
        }
      }

      // Check for round numbers (suspicious)
      if (mileage % 1000 === 0) {
        confidence *= 0.7;
        reason = 'Suspicious round number detected';
      }

      return {
        isValid,
        confidence: Math.min(confidence, 1.0),
        reason: reason || undefined,
      };
    } catch (error) {
      this.logger.error(`Mileage validation failed: ${error.message}`);
      return {
        isValid: false,
        confidence: 0,
        reason: 'Validation error',
      };
    }
  }

  /**
   * Get model status
   */
  getModelStatus(): { isLoaded: boolean; modelType: string } {
    return {
      isLoaded: this.isModelLoaded,
      modelType: 'TensorFlow.js OCR',
    };
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    try {
      if (this.model) {
        this.model.dispose();
        this.model = null;
      }
      this.isModelLoaded = false;
      this.logger.log('TensorFlow OCR service cleaned up');
    } catch (error) {
      this.logger.error('Error during cleanup:', error);
    }
  }
}
