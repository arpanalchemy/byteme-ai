import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  Min,
  Max,
  ValidateNested,
  IsObject,
  IsUUID,
} from "class-validator";
import { Type } from "class-transformer";
import { ProductCategory, ProductStatus } from "../entity/product.entity";

export class CreateProductDto {
  @ApiProperty({ description: "Product name", example: "Eco Water Bottle" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: "Product description",
    example: "Reusable, eco-friendly water bottle.",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: "Product category", enum: ProductCategory })
  @IsEnum(ProductCategory)
  category: ProductCategory;

  @ApiProperty({ description: "Product price", example: 19.99 })
  @IsNumber()
  price: number;

  @ApiPropertyOptional({ description: "Original price", example: 24.99 })
  @IsOptional()
  @IsNumber()
  originalPrice?: number;

  @ApiProperty({ description: "Stock quantity", example: 100 })
  @IsNumber()
  stockQuantity: number;

  @ApiPropertyOptional({
    description: "Main image URL",
    example: "https://example.com/image.jpg",
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: "Additional image URLs", type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({
    description: "Product specifications",
    type: "object",
    example: { color: "green", size: "1L" },
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  specifications?: Record<string, any>;

  @ApiPropertyOptional({
    description: "Product tags",
    type: [String],
    example: ["eco", "bottle"],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: "Discount info",
    type: "object",
    example: { percentage: 10, validUntil: "2025-12-31", minimumPurchase: 2 },
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  discountInfo?: {
    percentage?: number;
    validUntil?: Date;
    minimumPurchase?: number;
  };

  @ApiPropertyOptional({ description: "Is eco-friendly", example: true })
  @IsOptional()
  @IsBoolean()
  isEcoFriendly?: boolean;

  @ApiPropertyOptional({
    description: "Eco description",
    example: "Made from recycled materials.",
  })
  @IsOptional()
  @IsString()
  ecoDescription?: string;

  @ApiPropertyOptional({
    description: "Shipping info",
    type: "object",
    example: {
      weight: 0.5,
      dimensions: { length: 10, width: 5, height: 5 },
      shippingCost: 2.99,
      estimatedDelivery: "3-5 days",
    },
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  shippingInfo?: {
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
    shippingCost?: number;
    estimatedDelivery?: string;
  };
}

export class UpdateProductDto {
  @ApiPropertyOptional({
    description: "Product name",
    example: "Eco Water Bottle",
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: "Product description",
    example: "Reusable, eco-friendly water bottle.",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: "Product category",
    enum: ProductCategory,
  })
  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @ApiPropertyOptional({ description: "Product price", example: 19.99 })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ description: "Original price", example: 24.99 })
  @IsOptional()
  @IsNumber()
  originalPrice?: number;

  @ApiPropertyOptional({ description: "Stock quantity", example: 100 })
  @IsOptional()
  @IsNumber()
  stockQuantity?: number;

  @ApiPropertyOptional({ description: "Product status", enum: ProductStatus })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({
    description: "Main image URL",
    example: "https://example.com/image.jpg",
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: "Additional image URLs", type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({
    description: "Product specifications",
    type: "object",
    example: { color: "green", size: "1L" },
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  specifications?: Record<string, any>;

  @ApiPropertyOptional({
    description: "Product tags",
    type: [String],
    example: ["eco", "bottle"],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: "Discount info",
    type: "object",
    example: { percentage: 10, validUntil: "2025-12-31", minimumPurchase: 2 },
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  discountInfo?: {
    percentage?: number;
    validUntil?: Date;
    minimumPurchase?: number;
  };

  @ApiPropertyOptional({ description: "Is eco-friendly", example: true })
  @IsOptional()
  @IsBoolean()
  isEcoFriendly?: boolean;

  @ApiPropertyOptional({
    description: "Eco description",
    example: "Made from recycled materials.",
  })
  @IsOptional()
  @IsString()
  ecoDescription?: string;

  @ApiPropertyOptional({
    description: "Shipping info",
    type: "object",
    example: {
      weight: 0.5,
      dimensions: { length: 10, width: 5, height: 5 },
      shippingCost: 2.99,
      estimatedDelivery: "3-5 days",
    },
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  shippingInfo?: {
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
    shippingCost?: number;
    estimatedDelivery?: string;
  };
}

export class CreateOrderDto {
  @ApiProperty({
    description: "Product ID",
    example: "a1b2c3d4-e5f6-7890-abcd-1234567890ab",
  })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: "Quantity", example: 2 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({
    description: "Shipping address",
    type: "object",
    example: {
      street: "123 Main St",
      city: "Metropolis",
      state: "NY",
      zipCode: "12345",
      country: "USA",
    },
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  @ApiPropertyOptional({
    description: "Customer notes",
    example: "Please deliver after 5 PM.",
  })
  @IsOptional()
  @IsString()
  customerNotes?: string;
}

export class ProductResponseDto {
  @ApiProperty({
    description: "Product ID",
    example: "a1b2c3d4-e5f6-7890-abcd-1234567890ab",
  })
  id: string;

  @ApiProperty({ description: "Product name", example: "Eco Water Bottle" })
  name: string;

  @ApiPropertyOptional({
    description: "Product description",
    example: "Reusable, eco-friendly water bottle.",
  })
  description?: string;

  @ApiProperty({ description: "Product category", enum: ProductCategory })
  category: ProductCategory;

  @ApiProperty({ description: "Product price", example: 19.99 })
  price: number;

  @ApiPropertyOptional({ description: "Original price", example: 24.99 })
  originalPrice?: number;

  @ApiProperty({ description: "Stock quantity", example: 100 })
  stockQuantity: number;

  @ApiProperty({ description: "Product status", enum: ProductStatus })
  status: ProductStatus;

  @ApiPropertyOptional({
    description: "Main image URL",
    example: "https://example.com/image.jpg",
  })
  imageUrl?: string;

  @ApiPropertyOptional({ description: "Additional image URLs", type: [String] })
  images?: string[];

  @ApiPropertyOptional({
    description: "Product specifications",
    type: "object",
    additionalProperties: true,
  })
  specifications?: Record<string, any>;

  @ApiPropertyOptional({ description: "Product tags", type: [String] })
  tags?: string[];

  @ApiPropertyOptional({
    description: "Discount info",
    type: "object",
    additionalProperties: true,
  })
  discountInfo?: {
    percentage?: number;
    validUntil?: Date;
    minimumPurchase?: number;
  };

  @ApiPropertyOptional({ description: "Is eco-friendly", example: true })
  isEcoFriendly?: boolean;

  @ApiPropertyOptional({
    description: "Eco description",
    example: "Made from recycled materials.",
  })
  ecoDescription?: string;

  @ApiPropertyOptional({
    description: "Shipping info",
    type: "object",
    additionalProperties: true,
  })
  shippingInfo?: {
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
    shippingCost?: number;
    estimatedDelivery?: string;
  };

  @ApiProperty({
    description: "Creation date",
    example: "2024-01-15T10:30:00Z",
  })
  createdAt: Date;

  @ApiProperty({
    description: "Last update date",
    example: "2024-01-15T10:30:00Z",
  })
  updatedAt: Date;
}

export class OrderResponseDto {
  @ApiProperty({
    description: "Order ID",
    example: "a1b2c3d4-e5f6-7890-abcd-1234567890ab",
  })
  id: string;

  @ApiProperty({
    description: "User ID",
    example: "a1b2c3d4-e5f6-7890-abcd-1234567890ab",
  })
  userId: string;

  @ApiProperty({
    description: "Product ID",
    example: "a1b2c3d4-e5f6-7890-abcd-1234567890ab",
  })
  productId: string;

  @ApiProperty({ description: "Quantity", example: 2 })
  quantity: number;

  @ApiProperty({ description: "Total amount", example: 39.98 })
  totalAmount: number;

  @ApiPropertyOptional({
    description: "Shipping address",
    type: "object",
    additionalProperties: true,
  })
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  @ApiPropertyOptional({
    description: "Customer notes",
    example: "Please deliver after 5 PM.",
  })
  customerNotes?: string;

  @ApiProperty({
    description: "Order status",
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
  })
  status: string;

  @ApiProperty({
    description: "Payment status",
    enum: ["pending", "paid", "failed", "refunded"],
  })
  paymentStatus: string;

  @ApiProperty({
    description: "Creation date",
    example: "2024-01-15T10:30:00Z",
  })
  createdAt: Date;

  @ApiProperty({
    description: "Last update date",
    example: "2024-01-15T10:30:00Z",
  })
  updatedAt: Date;
}

export class ProductQueryDto {
  @ApiPropertyOptional({ description: "Page number", example: 1, minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: "Items per page",
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: "Product category",
    enum: ProductCategory,
  })
  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @ApiPropertyOptional({ description: "Search term", example: "water bottle" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: "Minimum price", example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: "Maximum price", example: 50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ description: "Eco-friendly filter", example: true })
  @IsOptional()
  @IsBoolean()
  ecoFriendly?: boolean;
}

export class OrderQueryDto {
  @ApiPropertyOptional({ description: "Page number", example: 1, minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: "Items per page",
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: "Order status",
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
  })
  @IsOptional()
  @IsString()
  status?: string;
}
