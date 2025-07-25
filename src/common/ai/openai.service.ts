import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { S3Service } from '../upload/s3.service';

export interface ImageAnalysisResult {
  vehicleType: string;
  estimatedMake?: string;
  estimatedModel?: string;
  imageQuality: 'excellent' | 'good' | 'fair' | 'poor';
  mileageReadable: boolean;
  confidenceScore: number;
  additionalInsights: string;
  vehicleFeatures: string[];
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
    private readonly s3Service: S3Service,
  ) {
    const OPENAI_API_KEY =
      this.configService.get("OPENAI_API_KEY") || process.env.OPENAI_API_KEY;
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
    console.log(
      '🚀 ~ OpenAIService ~ convertImageToBase64 ~ imageUrl:',
      imageUrl,
    );
    try {
      // If it's already a base64 data URL, return as is
      if (imageUrl.startsWith('data:image/')) {
        return imageUrl;
      }

      // If it's an S3 URL, use S3Service to download
      if (imageUrl.includes('s3.ca-central-1.amazonaws.com')) {
        const key = this.s3Service.extractKeyFromUrl(imageUrl);
        if (!key) {
          throw new Error('Invalid S3 URL format');
        }

        return await this.s3Service.downloadImageAsBase64(key);
      }

      // For other URLs, try to fetch and convert
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const mimeType = response.headers.get('content-type') || 'image/jpeg';

      return `data:${mimeType};base64,${base64}`;
    } catch (error) {
      console.log('🚀 ~ OpenAIService ~ convertImageToBase64 ~ error:', error);
      this.logger.error(`Failed to convert image to base64: ${error.message}`);
      throw new Error('Failed to process image for AI analysis');
    }
  }

  /**
   * Analyze odometer image with GPT-4 Vision
   */
  async analyzeOdometerImage(imageUrl: string): Promise<ImageAnalysisResult> {
    try {
      this.logger.log('Starting GPT-4 Vision analysis of odometer image');

      // Convert image to base64
      const base64Image = await this.convertImageToBase64(imageUrl);

      const prompt = `Analyze this odometer image and provide a detailed analysis in JSON format:

{
  "vehicleType": "sedan|suv|motorcycle|scooter|truck|van|other",
  "estimatedMake": "brand name if visible",
  "estimatedModel": "model name if visible", 
  "imageQuality": "excellent|good|fair|poor",
  "mileageReadable": true/false,
  "confidenceScore": 0.0-1.0,
  "additionalInsights": "detailed observations about the image",
  "vehicleFeatures": ["feature1", "feature2", "feature3"]
}

Focus on:
1. Vehicle identification and type
2. Image quality assessment
3. Mileage readability
4. Any visible vehicle details
5. Dashboard/instrument cluster features

Be precise and provide confidence scores based on image clarity.`;

      console.log('1:15:46 PM', this.openai);
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
              {
                type: 'image_url',
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
        throw new Error('No analysis result from OpenAI');
      }

      // Parse JSON response
      const analysis = this.parseAnalysisResult(analysisText);

      this.logger.log(
        `Analysis completed with confidence: ${analysis.confidenceScore}`,
      );
      return analysis;
    } catch (error) {
      console.log('🚀 ~ OpenAIService ~ analyzeOdometerImage ~ error:', error);
      this.logger.error(`OpenAI analysis failed: ${error.message}`);
      return {
        vehicleType: 'unknown',
        estimatedMake: 'unknown',
        estimatedModel: 'unknown',
        imageQuality: 'poor',
        mileageReadable: false,
        confidenceScore: 0,
        additionalInsights: '',
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
      this.logger.log('Detecting vehicle details from image');

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
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
              {
                type: 'image_url',
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
        throw new Error('No vehicle detection result from OpenAI');
      }

      const detection = this.parseVehicleDetection(detectionText);

      this.logger.log(
        `Vehicle detection completed: ${detection.vehicleType} (${detection.confidence})`,
      );
      return detection;
    } catch (error) {
      this.logger.error(`Vehicle detection failed: ${error.message}`);
      throw new Error('Failed to detect vehicle');
    }
  }

  /**
   * Validate OCR results with AI
   */
  async validateOcrResult(
    imageUrl: string,
    extractedMileage: string,
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
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
              {
                type: 'image_url',
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
        throw new Error('No validation result from OpenAI');
      }

      const validation = this.parseValidationResult(validationText);

      this.logger.log(
        `OCR validation completed: ${validation.isValid} (${validation.confidence})`,
      );
      return validation;
    } catch (error) {
      this.logger.error(`OCR validation failed: ${error.message}`);
      throw new Error('Failed to validate OCR result');
    }
  }

  /**
   * Parse analysis result from OpenAI response
   */
  private parseAnalysisResult(text: string): ImageAnalysisResult {
    try {
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        vehicleType: parsed.vehicleType || 'unknown',
        estimatedMake: parsed.estimatedMake,
        estimatedModel: parsed.estimatedModel,
        imageQuality: parsed.imageQuality || 'fair',
        mileageReadable: parsed.mileageReadable || false,
        confidenceScore: parsed.confidenceScore || 0.5,
        additionalInsights: parsed.additionalInsights || '',
        vehicleFeatures: parsed.vehicleFeatures || [],
        analysisTimestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to parse analysis result: ${error.message}`);
      throw new Error('Invalid analysis result format');
    }
  }

  /**
   * Parse vehicle detection result
   */
  private parseVehicleDetection(text: string): VehicleDetectionResult {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        vehicleType: parsed.vehicleType || 'unknown',
        make: parsed.make,
        model: parsed.model,
        year: parsed.year,
        features: parsed.features || [],
        confidence: parsed.confidence || 0.5,
      };
    } catch (error) {
      this.logger.error(`Failed to parse vehicle detection: ${error.message}`);
      throw new Error('Invalid vehicle detection format');
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
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        isValid: parsed.isValid || false,
        confidence: parsed.confidence || 0.5,
        suggestedMileage: parsed.suggestedMileage,
      };
    } catch (error) {
      this.logger.error(`Failed to parse validation result: ${error.message}`);
      throw new Error('Invalid validation result format');
    }
  }
}
