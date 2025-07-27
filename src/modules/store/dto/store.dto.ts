import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsEnum,
  IsUUID,
  Min,
  Max,
} from "class-validator";
import { ProductStatus, ProductCategory } from "../entity/product.entity";

export enum OrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsEnum(ProductCategory)
  category: ProductCategory;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  originalPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stockQuantity?: number;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  images?: string[];

  @IsOptional()
  specifications?: Record<string, any>;

  @IsOptional()
  tags?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  soldCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  viewCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  reviewCount?: number;

  @IsOptional()
  discountInfo?: {
    percentage?: number;
    validUntil?: Date;
    minimumPurchase?: number;
  };

  @IsOptional()
  isEcoFriendly?: boolean;

  @IsOptional()
  @IsString()
  ecoDescription?: string;

  @IsOptional()
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
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stockQuantity?: number;
}

export class CreateOrderDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  @IsOptional()
  @IsString()
  customerNotes?: string;
}

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @IsOptional()
  @IsDateString()
  shippedAt?: string;

  @IsOptional()
  @IsDateString()
  deliveredAt?: string;
}
