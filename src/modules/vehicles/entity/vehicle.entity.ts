import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from '../../users/entity/user.entity';

export enum VehicleType {
  CAR = 'car',
  SUV = 'suv',
  MOTORCYCLE = 'motorcycle',
  SCOOTER = 'scooter',
  TRUCK = 'truck',
  VAN = 'van',
  OTHER = 'other',
}

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Index()
  @Column({ name: 'user_id' })
  userId: string;

  @Column({
    type: 'enum',
    enum: VehicleType,
    default: VehicleType.CAR,
  })
  vehicleType: VehicleType;

  @Column({ nullable: true })
  make?: string;

  @Column({ nullable: true })
  model?: string;

  @Column({ nullable: true })
  year?: number;

  @Column({ name: 'plate_number', nullable: true })
  plateNumber?: string;

  @Column({
    name: 'emission_factor',
    type: 'decimal',
    precision: 10,
    scale: 4,
    default: 0.2,
  })
  emissionFactor: number; // CO2 kg per km

  @Column({
    name: 'total_mileage',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  totalMileage: number;

  @Column({
    name: 'total_carbon_saved',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  totalCarbonSaved: number;

  @Column({ name: 'last_upload_date', nullable: true })
  lastUploadDate?: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_primary', default: false })
  isPrimary: boolean; // Primary vehicle for the user

  @Column({ name: 'vehicle_image_url', nullable: true })
  vehicleImageUrl?: string;

  @Column({ name: 'detected_features', type: 'json', nullable: true })
  detectedFeatures?: string[];

  @Column({
    name: 'ai_confidence_score',
    type: 'decimal',
    precision: 3,
    scale: 2,
    nullable: true,
  })
  aiConfidenceScore?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Virtual properties
  get displayName(): string {
    if (this.make && this.model) {
      return `${this.make} ${this.model}`;
    }
    if (this.make) {
      return this.make;
    }
    return this.vehicleType.charAt(0).toUpperCase() + this.vehicleType.slice(1);
  }

  get carbonEfficiency(): number {
    return this.emissionFactor;
  }

  get mileageFormatted(): string {
    return `${this.totalMileage.toFixed(1)} km`;
  }

  get carbonSavedFormatted(): string {
    return `${this.totalCarbonSaved.toFixed(2)} kg CO₂`;
  }
}
