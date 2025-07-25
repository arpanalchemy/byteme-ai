import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as sharp from 'sharp';

export interface UploadResult {
  key: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
  mimeType: string;
}

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;

  constructor(private readonly configService: ConfigService) {
    this.region = this.configService.get('AWS_REGION', 'ca-central-1');
    this.bucketName = this.configService.get(
      'S3_BUCKET_NAME',
      'drive-earn-uploads',
    );

    const accessKeyId = this.configService.get('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get('AWS_SECRET_ACCESS_KEY');

    if (!accessKeyId || !secretAccessKey) {
      this.logger.warn('AWS credentials not found, S3 operations will fail');
    }

    this.s3Client = new S3Client({
      region: this.region,
      credentials:
        accessKeyId && secretAccessKey
          ? {
              accessKeyId,
              secretAccessKey,
            }
          : undefined,
    });
  }

  /**
   * Upload image to S3 with optimization
   */
  async uploadImage(
    file: Express.Multer.File,
    userId: string,
    vehicleId?: string,
  ): Promise<UploadResult> {
    try {
      this.logger.log(`Uploading image for user: ${userId}`);

      // Generate unique key
      const timestamp = Date.now();
      const key = `uploads/${userId}/${timestamp}-${file.originalname}`;
      const thumbnailKey = `thumbnails/${userId}/${timestamp}-thumb-${file.originalname}`;

      // Optimize image
      const optimizedImage = await this.optimizeImage(file.buffer);

      // Create thumbnail
      const thumbnail = await this.createThumbnail(file.buffer);

      // Upload original image
      await this.uploadToS3(key, optimizedImage, file.mimetype);

      // Upload thumbnail
      await this.uploadToS3(thumbnailKey, thumbnail, file.mimetype);

      const result: UploadResult = {
        key,
        url: `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`,
        thumbnailUrl: `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${thumbnailKey}`,
        size: optimizedImage.length,
        mimeType: file.mimetype,
      };

      this.logger.log(`Image uploaded successfully: ${result.url}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to upload image: ${error.message}`);
      throw new Error('Failed to upload image');
    }
  }

  /**
   * Generate presigned URL for direct upload
   */
  async generatePresignedUrl(
    fileName: string,
    userId: string,
    contentType: string,
  ): Promise<{ uploadUrl: string; key: string }> {
    try {
      const key = `uploads/${userId}/${Date.now()}-${fileName}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
        Expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      });

      const uploadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 900,
      });

      return { uploadUrl, key };
    } catch (error) {
      this.logger.error(`Failed to generate presigned URL: ${error.message}`);
      throw new Error('Failed to generate upload URL');
    }
  }

  /**
   * Delete image from S3
   */
  async deleteImage(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`Image deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete image: ${error.message}`);
      throw new Error('Failed to delete image');
    }
  }

  /**
   * Get image URL
   */
  getImageUrl(key: string): string {
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
  }

  /**
   * Download image from S3 and convert to base64
   */
  async downloadImageAsBase64(key: string): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);

      if (!response.Body) {
        throw new Error('No image data received from S3');
      }

      // Convert stream to buffer
      const chunks: Uint8Array[] = [];
      for await (const chunk of response.Body as any) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);

      // Convert to base64
      const base64 = buffer.toString('base64');
      const mimeType = response.ContentType || 'image/jpeg';

      return `data:${mimeType};base64,${base64}`;
    } catch (error) {
      this.logger.error(`Failed to download image from S3: ${error.message}`);
      throw new Error('Failed to download image from S3');
    }
  }

  /**
   * Extract S3 key from URL
   */
  extractKeyFromUrl(url: string): string | null {
    try {
      const urlParts = url.split('.com/');
      if (urlParts.length < 2) {
        return null;
      }
      return urlParts[1];
    } catch (error) {
      this.logger.error(`Failed to extract key from URL: ${error.message}`);
      return null;
    }
  }

  /**
   * Optimize image for storage
   */
  private async optimizeImage(buffer: Buffer): Promise<Buffer> {
    try {
      return await sharp(buffer)
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85, progressive: true })
        .toBuffer();
    } catch (error) {
      this.logger.warn(
        `Failed to optimize image, using original: ${error.message}`,
      );
      return buffer;
    }
  }

  /**
   * Create thumbnail
   */
  private async createThumbnail(buffer: Buffer): Promise<Buffer> {
    try {
      return await sharp(buffer)
        .resize(300, 300, { fit: 'cover' })
        .jpeg({ quality: 70 })
        .toBuffer();
    } catch (error) {
      this.logger.warn(`Failed to create thumbnail: ${error.message}`);
      return buffer;
    }
  }

  /**
   * Upload buffer to S3
   */
  private async uploadToS3(
    key: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: 'private',
      Metadata: {
        uploadedAt: new Date().toISOString(),
      },
    });

    await this.s3Client.send(command);
  }

  /**
   * Validate file type
   */
  validateFileType(mimeType: string): boolean {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    return allowedTypes.includes(mimeType);
  }

  /**
   * Validate file size
   */
  validateFileSize(size: number): boolean {
    const maxSize = 10 * 1024 * 1024; // 10MB
    return size <= maxSize;
  }
}
