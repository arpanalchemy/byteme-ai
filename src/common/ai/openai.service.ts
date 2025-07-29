import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OpenAI from "openai";
import { S3Service } from "../upload/s3.service";

export interface ImageAnalysisResult {
  vehicleType: string;
  estimatedMake?: string | null;
  estimatedModel?: string | null;
  imageQuality: "excellent" | "good" | "fair" | "poor";
  mileageReadable: boolean;
  confidenceScore: number;
  additionalInsights: string;
  vehicleFeatures: string[];
  // Trip-related details
  co2Avoided?: string;
  distanceThisTrip?: string;
  totalDistanceAllTime?: string;
  batteryRemaining?: string;
  vehicleStatus?: string;
  time?: string;
  analysisTimestamp: string;
}

export interface VehicleDetectionResult {
  vehicleType: string;
  make?: string;
  model?: string;
  year?: number;
  features: string[];
  confidence: number;
}

@Injectable()
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name);
  private readonly openai: OpenAI;

  constructor(
    private readonly configService: ConfigService,
    private readonly s3Service: S3Service
  ) {
    const OPENAI_API_KEY =
      this.configService.get("OPENAI_API_KEY") ||
      "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";

    if (OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: OPENAI_API_KEY,
      });
    }
  }

  /**
   * Convert image URL to base64 for OpenAI
   */
  private async convertImageToBase64(imageUrl: string): Promise<string> {
    try {
      // If it's already a base64 data URL, return as is
      if (imageUrl.startsWith("data:image/")) {
        return imageUrl;
      }

      // If it's an S3 URL, use S3Service to download
      if (imageUrl.includes("amazonaws.com")) {
        const key = this.s3Service.extractKeyFromUrl(imageUrl);
        if (!key) {
          throw new Error("Invalid S3 URL format");
        }

        return await this.s3Service.downloadImageAsBase64(key);
      }

      // For other URLs, try to fetch and convert
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const mimeType = response.headers.get("content-type") || "image/jpeg";

      return `data:${mimeType};base64,${base64}`;
    } catch (error) {
      this.logger.error(`Failed to convert image to base64: ${error.message}`);
      throw new Error("Failed to process image for AI analysis");
    }
  }

  /**
   * Analyze odometer image with GPT-4 Vision
   */
  async analyzeOdometerImage(imageUrl: string): Promise<ImageAnalysisResult> {
    try {
      this.logger.log("Starting GPT-4 Vision analysis of odometer image");

      // Convert image to base64
      const base64Image = await this.convertImageToBase64(imageUrl);

      const prompt = `Analyze the uploaded image of the vehicle's odometer/dashboard and provide a detailed analysis.

IMPORTANT: Respond ONLY with valid JSON in the following format:

{
  "vehicleType": "sedan|suv|motorcycle|scooter|truck|van|other",
  "estimatedMake": "brand name if visible",
  "estimatedModel": "model name if visible", 
  "imageQuality": "excellent|good|fair|poor",
  "mileageReadable": true/false,
  "confidenceScore": 0.0-1.0,
  "additionalInsights": "detailed observations about the image",
  "vehicleFeatures": ["feature1", "feature2", "feature3"],
  "co2Avoided": "58 kg",
  "distanceThisTrip": "0.0 km",
  "totalDistanceAllTime": "2025 km",
  "batteryRemaining": "49%",
  "vehicleStatus": "Parked",
  "time": "10:35 PM"
}

Analysis Guidelines:
1. Vehicle Type: Identify the type of vehicle based on visible characteristics
2. Make/Model: Estimate brand and model if visible in the dashboard/instruments
3. Image Quality: Rate clarity and visibility of important details
4. Mileage Readability: Assess if odometer reading is clearly visible and readable
5. Confidence Score: Rate your certainty (0.0 = low, 1.0 = high)
6. Additional Insights: Provide detailed observations about what you see
7. Vehicle Features: List any visible dashboard features, instruments, or indicators
8. Trip Details: Extract trip-related details such as CO2 avoided, distance, battery, and time from the dashboard

Do not include any text outside the JSON response.`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: base64Image,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
        temperature: 0.1,
      });

      const analysisText = response.choices[0]?.message?.content;
      if (!analysisText) {
        throw new Error("No analysis result from OpenAI");
      }

      // Parse JSON response
      const analysis = this.parseAnalysisResult(analysisText);

      this.logger.log(
        `Analysis completed with confidence: ${analysis.confidenceScore}`
      );
      return analysis;
    } catch (error) {
      this.logger.error(`OpenAI analysis failed: ${error.message}`);
      return {
        vehicleType: "unknown",
        estimatedMake: "unknown",
        estimatedModel: "unknown",
        imageQuality: "poor",
        mileageReadable: false,
        confidenceScore: 0,
        additionalInsights: "",
        vehicleFeatures: [],
        analysisTimestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Detect vehicle details from image
   */
  async detectVehicle(imageUrl: string): Promise<VehicleDetectionResult> {
    try {
      this.logger.log("Detecting vehicle details from image");

      // Convert image to base64
      const base64Image = await this.convertImageToBase64(imageUrl);

      const prompt = `Analyze this vehicle image and identify vehicle details in JSON format:

{
  "vehicleType": "sedan|suv|motorcycle|scooter|truck|van|other",
  "make": "brand name",
  "model": "model name", 
  "year": "estimated year if visible",
  "features": ["feature1", "feature2"],
  "confidence": 0.0-1.0
}

Focus on:
1. Vehicle type and category
2. Make and model identification
3. Year estimation if possible
4. Distinctive features
5. Overall confidence in identification`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: base64Image,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
        temperature: 0.1,
      });

      const detectionText = response.choices[0]?.message?.content;
      if (!detectionText) {
        throw new Error("No vehicle detection result from OpenAI");
      }

      const detection = this.parseVehicleDetection(detectionText);

      this.logger.log(
        `Vehicle detection completed: ${detection.vehicleType} (${detection.confidence})`
      );
      return detection;
    } catch (error) {
      this.logger.error(`Vehicle detection failed: ${error.message}`);
      throw new Error("Failed to detect vehicle");
    }
  }

  /**
   * Store analysis results in a structured format for database storage
   */
  storeAnalysisResults(
    uploadId: string,
    analysis: ImageAnalysisResult,
    vehicleDetection?: VehicleDetectionResult
  ): {
    openaiAnalysis: any;
    vehicleDetected: any;
    processingMetadata: any;
  } {
    try {
      const processingMetadata = {
        analysisTimestamp: analysis.analysisTimestamp,
        modelUsed: "gpt-4o-mini",
        processingVersion: "1.0",
        confidenceThreshold: 0.7,
      };

      const openaiAnalysis = {
        vehicleType: analysis.vehicleType,
        estimatedMake: analysis.estimatedMake,
        estimatedModel: analysis.estimatedModel,
        imageQuality: analysis.imageQuality,
        mileageReadable: analysis.mileageReadable,
        confidenceScore: analysis.confidenceScore,
        additionalInsights: analysis.additionalInsights,
        vehicleFeatures: analysis.vehicleFeatures,
        // Trip-related details
        co2Avoided: analysis.co2Avoided,
        distanceThisTrip: analysis.distanceThisTrip,
        totalDistanceAllTime: analysis.totalDistanceAllTime,
        batteryRemaining: analysis.batteryRemaining,
        vehicleStatus: analysis.vehicleStatus,
        time: analysis.time,
        analysisTimestamp: analysis.analysisTimestamp,
      };

      const vehicleDetected = vehicleDetection
        ? {
            vehicleType: vehicleDetection.vehicleType,
            make: vehicleDetection.make,
            model: vehicleDetection.model,
            year: vehicleDetection.year,
            features: vehicleDetection.features,
            confidence: vehicleDetection.confidence,
          }
        : null;

      this.logger.log(`Stored analysis results for upload ${uploadId}`);

      return {
        openaiAnalysis,
        vehicleDetected,
        processingMetadata,
      };
    } catch (error) {
      this.logger.error(`Failed to store analysis results: ${error.message}`);
      throw new Error("Failed to store analysis results");
    }
  }

  /**
   * Format stored analysis results for API response
   */
  formatAnalysisResponse(
    openaiAnalysis: any,
    vehicleDetected?: any
  ): {
    vehicleType: string;
    estimatedMake?: string | null;
    estimatedModel?: string | null;
    imageQuality: "excellent" | "good" | "fair" | "poor";
    mileageReadable: boolean;
    confidenceScore: number;
    additionalInsights: string;
    vehicleFeatures: string[];
    // Trip-related details
    co2Avoided?: string | null;
    distanceThisTrip?: string | null;
    totalDistanceAllTime?: string | null;
    batteryRemaining?: string | null;
    vehicleStatus?: string | null;
    time?: string | null;
    vehicleDetection?: {
      vehicleType: string;
      make?: string;
      model?: string;
      year?: number;
      features: string[];
      confidence: number;
    };
  } {
    try {
      const formatted: any = {
        vehicleType: openaiAnalysis?.vehicleType || "unknown",
        estimatedMake: openaiAnalysis?.estimatedMake || null,
        estimatedModel: openaiAnalysis?.estimatedModel || null,
        imageQuality: openaiAnalysis?.imageQuality || "fair",
        mileageReadable: Boolean(openaiAnalysis?.mileageReadable),
        confidenceScore: parseFloat(openaiAnalysis?.confidenceScore) || 0,
        additionalInsights: openaiAnalysis?.additionalInsights || "",
        vehicleFeatures: Array.isArray(openaiAnalysis?.vehicleFeatures)
          ? openaiAnalysis.vehicleFeatures
          : [],
        // Trip-related details
        co2Avoided: openaiAnalysis?.co2Avoided || null,
        distanceThisTrip: openaiAnalysis?.distanceThisTrip || null,
        totalDistanceAllTime: openaiAnalysis?.totalDistanceAllTime || null,
        batteryRemaining: openaiAnalysis?.batteryRemaining || null,
        vehicleStatus: openaiAnalysis?.vehicleStatus || null,
        time: openaiAnalysis?.time || null,
      };

      if (vehicleDetected) {
        formatted.vehicleDetection = {
          vehicleType: vehicleDetected.vehicleType || "unknown",
          make: vehicleDetected.make,
          model: vehicleDetected.model,
          year: vehicleDetected.year,
          features: Array.isArray(vehicleDetected.features)
            ? vehicleDetected.features
            : [],
          confidence: parseFloat(vehicleDetected.confidence) || 0,
        };
      }

      return formatted;
    } catch (error) {
      this.logger.error(`Failed to format analysis response: ${error.message}`);
      return {
        vehicleType: "unknown",
        estimatedMake: null,
        estimatedModel: null,
        imageQuality: "poor",
        mileageReadable: false,
        confidenceScore: 0,
        additionalInsights: "Failed to format analysis results",
        vehicleFeatures: [],
        // Trip-related details
        co2Avoided: null,
        distanceThisTrip: null,
        totalDistanceAllTime: null,
        batteryRemaining: null,
        vehicleStatus: null,
        time: null,
      };
    }
  }

  /**
   * Validate OCR results with AI
   */
  async validateOcrResult(
    imageUrl: string,
    extractedMileage: string
  ): Promise<{
    isValid: boolean;
    confidence: number;
    suggestedMileage?: string;
  }> {
    try {
      this.logger.log(`Validating OCR result: ${extractedMileage}`);

      // Convert image to base64
      const base64Image = await this.convertImageToBase64(imageUrl);

      const prompt = `Validate this OCR result for an odometer image:

Extracted mileage: ${extractedMileage}

Please analyze the image and provide validation in JSON format:

{
  "isValid": true/false,
  "confidence": 0.0-1.0,
  "suggestedMileage": "corrected mileage if needed",
  "reasoning": "explanation for validation decision"
}

Consider:
1. Is the extracted mileage reasonable for a vehicle?
2. Does it match what you can see in the image?
3. Are there any obvious OCR errors?
4. What would be the correct mileage if different?`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: base64Image,
                },
              },
            ],
          },
        ],
        max_tokens: 300,
        temperature: 0.1,
      });

      const validationText = response.choices[0]?.message?.content;
      if (!validationText) {
        throw new Error("No validation result from OpenAI");
      }

      const validation = this.parseValidationResult(validationText);

      this.logger.log(
        `OCR validation completed: ${validation.isValid} (${validation.confidence})`
      );
      return validation;
    } catch (error) {
      this.logger.error(`OCR validation failed: ${error.message}`);
      throw new Error("Failed to validate OCR result");
    }
  }

  /**
   * Parse analysis result from OpenAI response
   */
  private parseAnalysisResult(text: string): ImageAnalysisResult {
    try {
      // Clean the text - remove any markdown formatting or extra text
      let cleanedText = text.trim();

      // Remove markdown code blocks if present
      cleanedText = cleanedText
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "");

      // Extract JSON from response - look for the first complete JSON object
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        this.logger.warn(
          `No JSON found in response: ${text.substring(0, 200)}...`
        );
        throw new Error("No JSON found in response");
      }

      const jsonString = jsonMatch[0];
      const parsed = JSON.parse(jsonString);

      // Validate and sanitize the parsed data
      const result: ImageAnalysisResult = {
        vehicleType: this.sanitizeVehicleType(parsed.vehicleType),
        estimatedMake: parsed.estimatedMake || null,
        estimatedModel: parsed.estimatedModel || null,
        imageQuality: this.sanitizeImageQuality(parsed.imageQuality),
        mileageReadable: Boolean(parsed.mileageReadable),
        confidenceScore: this.sanitizeConfidenceScore(parsed.confidenceScore),
        additionalInsights: parsed.additionalInsights || "",
        vehicleFeatures: Array.isArray(parsed.vehicleFeatures)
          ? parsed.vehicleFeatures
          : [],
        // Trip-related details
        co2Avoided: parsed.co2Avoided || null,
        distanceThisTrip: parsed.distanceThisTrip || null,
        totalDistanceAllTime: parsed.totalDistanceAllTime || null,
        batteryRemaining: parsed.batteryRemaining || null,
        vehicleStatus: parsed.vehicleStatus || null,
        time: parsed.time || null,
        analysisTimestamp: new Date().toISOString(),
      };

      this.logger.debug(
        `Parsed analysis result: ${JSON.stringify(result, null, 2)}`
      );
      return result;
    } catch (error) {
      this.logger.error(`Failed to parse analysis result: ${error.message}`);
      this.logger.error(`Raw response: ${text.substring(0, 500)}...`);

      // Return a safe fallback
      return {
        vehicleType: "unknown",
        estimatedMake: null,
        estimatedModel: null,
        imageQuality: "poor",
        mileageReadable: false,
        confidenceScore: 0,
        additionalInsights: "Failed to parse AI response",
        vehicleFeatures: [],
        // Trip-related details
        co2Avoided: null,
        distanceThisTrip: null,
        totalDistanceAllTime: null,
        batteryRemaining: null,
        vehicleStatus: null,
        time: null,
        analysisTimestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Sanitize vehicle type
   */
  private sanitizeVehicleType(vehicleType: any): string {
    const validTypes = [
      "sedan",
      "suv",
      "motorcycle",
      "scooter",
      "truck",
      "van",
      "other",
    ];
    const type = String(vehicleType || "")
      .toLowerCase()
      .trim();
    return validTypes.includes(type) ? type : "unknown";
  }

  /**
   * Sanitize image quality
   */
  private sanitizeImageQuality(
    quality: any
  ): "excellent" | "good" | "fair" | "poor" {
    const validQualities = ["excellent", "good", "fair", "poor"] as const;
    const qualityStr = String(quality || "")
      .toLowerCase()
      .trim();
    return validQualities.includes(qualityStr as any)
      ? (qualityStr as "excellent" | "good" | "fair" | "poor")
      : "fair";
  }

  /**
   * Sanitize confidence score
   */
  private sanitizeConfidenceScore(score: any): number {
    const num = parseFloat(score);
    if (isNaN(num) || num < 0 || num > 1) {
      return 0.5; // Default to medium confidence
    }
    return Math.round(num * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Parse vehicle detection result
   */
  private parseVehicleDetection(text: string): VehicleDetectionResult {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        vehicleType: parsed.vehicleType || "unknown",
        make: parsed.make,
        model: parsed.model,
        year: parsed.year,
        features: parsed.features || [],
        confidence: parsed.confidence || 0.5,
      };
    } catch (error) {
      this.logger.error(`Failed to parse vehicle detection: ${error.message}`);
      throw new Error("Invalid vehicle detection format");
    }
  }

  /**
   * Parse validation result
   */
  private parseValidationResult(text: string): {
    isValid: boolean;
    confidence: number;
    suggestedMileage?: string;
  } {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        isValid: parsed.isValid || false,
        confidence: parsed.confidence || 0.5,
        suggestedMileage: parsed.suggestedMileage,
      };
    } catch (error) {
      this.logger.error(`Failed to parse validation result: ${error.message}`);
      throw new Error("Invalid validation result format");
    }
  }
}
