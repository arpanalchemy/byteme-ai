import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "../../users/entity/user.entity";
import { Product } from "./product.entity";

export enum OrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
}

export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
  REFUNDED = "refunded",
}

@Entity("orders")
export class Order {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ name: "user_id" })
  userId: string;

  @ManyToOne(() => Product, { onDelete: "CASCADE" })
  @JoinColumn({ name: "product_id" })
  product: Product;

  @Column({ name: "product_id" })
  productId: string;

  @Column({ default: 1 })
  quantity: number;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: false,
  })
  unitPrice: number; // Price per unit in B3TR

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: false,
  })
  totalPrice: number; // Total price in B3TR

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
  })
  discountAmount?: number; // Discount amount in B3TR

  @Column({
    type: "enum",
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({
    type: "enum",
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Column({ type: "json", nullable: true })
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  @Column({ type: "json", nullable: true })
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  @Column({ nullable: true })
  trackingNumber?: string;

  @Column({ type: "json", nullable: true })
  trackingInfo?: {
    carrier?: string;
    trackingUrl?: string;
    estimatedDelivery?: Date;
    deliveredAt?: Date;
  };

  @Column({ type: "text", nullable: true })
  notes?: string; // Admin notes

  @Column({ type: "text", nullable: true })
  customerNotes?: string; // Customer notes

  @Column({ type: "json", nullable: true })
  metadata?: Record<string, any>; // Additional order metadata

  @Column({ nullable: true })
  cancelledAt?: Date;

  @Column({ nullable: true })
  cancelledBy?: string; // User ID who cancelled

  @Column({ type: "text", nullable: true })
  cancellationReason?: string;

  @Column({ nullable: true })
  refundedAt?: Date;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  refundAmount?: number;

  @Column({ type: "text", nullable: true })
  refundReason?: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  // Virtual properties
  get isCancellable(): boolean {
    return [OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(this.status);
  }

  get isRefundable(): boolean {
    return (
      this.paymentStatus === PaymentStatus.PAID &&
      [
        OrderStatus.CONFIRMED,
        OrderStatus.PROCESSING,
        OrderStatus.SHIPPED,
        OrderStatus.DELIVERED,
      ].includes(this.status)
    );
  }

  get formattedTotalPrice(): string {
    return `${this.totalPrice.toFixed(2)} B3TR`;
  }

  get formattedUnitPrice(): string {
    return `${this.unitPrice.toFixed(2)} B3TR`;
  }

  get hasDiscount(): boolean {
    return !!(this.discountAmount && this.discountAmount > 0);
  }

  get discountPercentage(): number {
    if (!this.hasDiscount) return 0;
    return (this.discountAmount / (this.unitPrice * this.quantity)) * 100;
  }
}
