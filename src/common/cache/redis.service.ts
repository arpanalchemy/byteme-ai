import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'redis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly redisClient: Redis.RedisClientType | null = null;
  private readonly defaultTtl = 3600; // 1 hour
  private isConnected = false;

  constructor(private readonly configService: ConfigService) {
    try {
      const redisUrl = this.configService.get(
        'REDIS_URL',
        'redis://localhost:6379',
      );
      const redisPassword = this.configService.get('REDIS_PASSWORD');

      // Only create Redis client if URL is provided and not empty
      if (redisUrl && redisUrl !== 'redis://localhost:6379') {
        this.redisClient = Redis.createClient({
          url: redisUrl,
          password: redisPassword,
        });

        this.redisClient.on('error', (err) => {
          this.logger.error('Redis Client Error:', err);
          this.isConnected = false;
        });

        this.redisClient.on('connect', () => {
          this.logger.log('Redis Client Connected');
          this.isConnected = true;
        });

        this.redisClient.connect().catch((err) => {
          this.logger.error('Failed to connect to Redis:', err);
          this.isConnected = false;
        });
      } else {
        this.logger.warn(
          'Redis URL not configured, running without Redis cache',
        );
      }
    } catch (error) {
      console.log('🚀 ~ RedisService ~ constructor ~ error:', error);
      this.logger.error('Failed to initialize Redis client:', error);
      this.isConnected = false;
    }
  }

  /**
   * Set cache with TTL
   */
  async set(
    key: string,
    value: any,
    ttl: number = this.defaultTtl,
  ): Promise<void> {
    if (!this.redisClient || !this.isConnected) {
      this.logger.debug(`Redis not available, skipping cache set: ${key}`);
      return;
    }

    try {
      const serializedValue = JSON.stringify(value);
      await this.redisClient.setEx(key, ttl, serializedValue);
      this.logger.debug(`Cache set: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to set cache for key ${key}:`, error);
      // Don't throw error, just log it
    }
  }

  /**
   * Get cache value
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.redisClient || !this.isConnected) {
      this.logger.debug(`Redis not available, cache miss: ${key}`);
      return null;
    }

    try {
      const value = await this.redisClient.get(key);
      if (!value) {
        this.logger.debug(`Cache miss: ${key}`);
        return null;
      }

      this.logger.debug(`Cache hit: ${key}`);
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`Failed to get cache for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Delete cache key
   */
  async delete(key: string): Promise<void> {
    if (!this.redisClient || !this.isConnected) {
      this.logger.debug(`Redis not available, skipping cache delete: ${key}`);
      return;
    }

    try {
      await this.redisClient.del(key);
      this.logger.debug(`Cache deleted: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete cache for key ${key}:`, error);
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    if (!this.redisClient || !this.isConnected) {
      this.logger.debug(`Redis not available, key does not exist: ${key}`);
      return false;
    }

    try {
      const result = await this.redisClient.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Failed to check existence for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Set cache for OpenAI analysis
   */
  async setAnalysisCache(imageHash: string, analysis: any): Promise<void> {
    const key = `analysis:${imageHash}`;
    await this.set(key, analysis, 86400); // 24 hours
  }

  /**
   * Get cached OpenAI analysis
   */
  async getAnalysisCache<T>(imageHash: string): Promise<T | null> {
    const key = `analysis:${imageHash}`;
    return this.get<T>(key);
  }

  /**
   * Set cache for vehicle detection
   */
  async setVehicleDetectionCache(
    imageHash: string,
    detection: any,
  ): Promise<void> {
    const key = `vehicle:${imageHash}`;
    await this.set(key, detection, 86400); // 24 hours
  }

  /**
   * Get cached vehicle detection
   */
  async getVehicleDetectionCache<T>(imageHash: string): Promise<T | null> {
    const key = `vehicle:${imageHash}`;
    return this.get<T>(key);
  }

  /**
   * Set cache for OCR validation
   */
  async setOcrValidationCache(
    imageHash: string,
    validation: any,
  ): Promise<void> {
    const key = `ocr:${imageHash}`;
    await this.set(key, validation, 3600); // 1 hour
  }

  /**
   * Get cached OCR validation
   */
  async getOcrValidationCache<T>(imageHash: string): Promise<T | null> {
    const key = `ocr:${imageHash}`;
    return this.get<T>(key);
  }

  /**
   * Generate cache key from image URL
   */
  generateImageHash(imageUrl: string): string {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(imageUrl).digest('hex');
  }

  /**
   * Clear all cache
   */
  async clearAll(): Promise<void> {
    if (!this.redisClient || !this.isConnected) {
      this.logger.debug('Redis not available, skipping cache clear');
      return;
    }

    try {
      await this.redisClient.flushAll();
      this.logger.log('All cache cleared');
    } catch (error) {
      this.logger.error('Failed to clear cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{ keys: number; memory: string }> {
    if (!this.redisClient || !this.isConnected) {
      this.logger.debug('Redis not available, returning empty stats');
      return { keys: 0, memory: 'not available' };
    }

    try {
      const info = await this.redisClient.info('memory');
      const keys = await this.redisClient.dbSize();

      // Parse memory info
      const memoryMatch = info.match(/used_memory_human:(\S+)/);
      const memory = memoryMatch ? memoryMatch[1] : 'unknown';

      return { keys, memory };
    } catch (error) {
      this.logger.error('Failed to get cache stats:', error);
      return { keys: 0, memory: 'unknown' };
    }
  }

  /**
   * Cleanup on module destroy
   */
  async onModuleDestroy() {
    if (!this.redisClient || !this.isConnected) {
      this.logger.debug('Redis not available, skipping cleanup');
      return;
    }

    try {
      await this.redisClient.quit();
      this.logger.log('Redis connection closed');
    } catch (error) {
      this.logger.error('Error closing Redis connection:', error);
    }
  }
}
