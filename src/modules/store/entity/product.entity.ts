import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Order } from "./order.entity";

export enum ProductCategory {
  ELECTRONICS = "electronics",
  CLOTHING = "clothing",
  HOME = "home",
  SPORTS = "sports",
  BOOKS = "books",
  OTHER = "other",
}

export enum ProductStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  OUT_OF_STOCK = "out_of_stock",
}

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({
    type: "enum",
    enum: ProductCategory,
    default: ProductCategory.OTHER,
  })
  category: ProductCategory;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: false,
  })
  price: number; // Price in B3TR tokens

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
  })
  originalPrice?: number; // Original price in USD

  @Column({ default: 0 })
  stockQuantity: number;

  @Column({
    type: "enum",
    enum: ProductStatus,
    default: ProductStatus.ACTIVE,
  })
  status: ProductStatus;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ type: "json", nullable: true })
  images?: string[]; // Multiple product images

  @Column({ type: "json", nullable: true })
  specifications?: Record<string, any>; // Product specifications

  @Column({ type: "json", nullable: true })
  tags?: string[]; // Product tags for search

  @Column({ default: 0 })
  soldCount: number; // Number of units sold

  @Column({ default: 0 })
  viewCount: number; // Number of views

  @Column({ type: "decimal", precision: 3, scale: 2, default: 0 })
  rating: number; // Average rating (0-5)

  @Column({ default: 0 })
  reviewCount: number; // Number of reviews

  @Column({ type: "json", nullable: true })
  discountInfo?: {
    percentage?: number;
    validUntil?: Date;
    minimumPurchase?: number;
  };

  @Column({ default: true })
  isEcoFriendly: boolean; // Whether the product is eco-friendly

  @Column({ type: "text", nullable: true })
  ecoDescription?: string; // Description of eco-friendly features

  @Column({ type: "json", nullable: true })
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

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  // Relations
  @OneToMany(() => Order, (order) => order.product)
  orders: Order[];

  // Virtual properties
  get isInStock(): boolean {
    return this.stockQuantity > 0 && this.status === ProductStatus.ACTIVE;
  }

  get hasDiscount(): boolean {
    return !!(
      this.discountInfo?.percentage &&
      this.discountInfo.validUntil &&
      new Date() < this.discountInfo.validUntil
    );
  }

  get discountedPrice(): number {
    if (!this.hasDiscount) return this.price;
    return this.price * (1 - this.discountInfo.percentage / 100);
  }

  get displayPrice(): number {
    return this.hasDiscount ? this.discountedPrice : this.price;
  }

  get formattedPrice(): string {
    return `${this.displayPrice.toFixed(2)} B3TR`;
  }

  get originalFormattedPrice(): string {
    return this.originalPrice ? `$${this.originalPrice.toFixed(2)}` : "";
  }
}
