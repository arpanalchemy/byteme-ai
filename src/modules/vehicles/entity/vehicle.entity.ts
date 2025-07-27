import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
} from "typeorm";
import { User } from "../../users/entity/user.entity";

export enum VehicleType {
  CAR = "car",
  SUV = "suv",
  MOTORCYCLE = "motorcycle",
  SCOOTER = "scooter",
  TRUCK = "truck",
  ELECTRIC = "electric",
  HYBRID = "hybrid",
  PLUGIN_HYBRID = "plugin_hybrid",
  FUEL_CELL = "fuel_cell",
  VAN = "van",
  OTHER = "other",
}

@Entity("vehicles")
export class Vehicle {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  user: User;

  @Index()
  @Column({ name: "user_id" })
  userId: string;

  @Column({
    type: "enum",
    enum: VehicleType,
    default: VehicleType.CAR,
  })
  vehicleType: VehicleType;

  @Column({ name: "custom_name", nullable: true })
  customName?: string;

  @Column({ nullable: true })
  make?: string;

  @Column({ nullable: true })
  model?: string;

  @Column({ nullable: true })
  year?: number;

  @Column({ name: "plate_number", nullable: true })
  plateNumber?: string;

  @Column({
    name: "emission_factor",
    type: "decimal",
    precision: 10,
    scale: 4,
    default: 0.2,
  })
  emissionFactor: number; // CO2 kg per km

  @Column({
    name: "total_mileage",
    type: "decimal",
    precision: 10,
    scale: 2,
    default: 0,
  })
  totalMileage: number;

  @Column({
    name: "total_carbon_saved",
    type: "decimal",
    precision: 10,
    scale: 2,
    default: 0,
  })
  totalCarbonSaved: number;

  @Column({ name: "last_upload_date", nullable: true })
  lastUploadDate?: Date;

  @Column({ name: "is_active", default: true })
  isActive: boolean;

  @Column({ name: "is_primary", default: false })
  isPrimary: boolean; // Primary vehicle for the user

  @Column({ name: "vehicle_image_url", nullable: true })
  vehicleImageUrl?: string;

  @Column({ name: "detected_features", type: "json", nullable: true })
  detectedFeatures?: string[];

  @Column({
    name: "ai_confidence_score",
    type: "decimal",
    precision: 3,
    scale: 2,
    nullable: true,
  })
  aiConfidenceScore?: number;

  @Column({ name: "fuel_type", nullable: true })
  fuelType?: "electric" | "hybrid" | "gasoline" | "diesel" | "other";

  @Column({ name: "battery_capacity", nullable: true })
  batteryCapacity?: number; // kWh for electric vehicles

  @Column({ name: "range_km", nullable: true })
  rangeKm?: number; // Range in kilometers

  @Column({ name: "manufacturing_country", nullable: true })
  manufacturingCountry?: string;

  @Column({ name: "color", nullable: true })
  color?: string;

  @Column({ name: "vin", nullable: true })
  vin?: string; // Vehicle Identification Number

  @Column({ name: "insurance_info", type: "json", nullable: true })
  insuranceInfo?: {
    provider?: string;
    policyNumber?: string;
    expiryDate?: string;
  };

  @Column({ name: "maintenance_info", type: "json", nullable: true })
  maintenanceInfo?: {
    lastServiceDate?: string;
    nextServiceDate?: string;
    serviceHistory?: Array<{
      date: string;
      description: string;
      mileage: number;
    }>;
  };

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  // Virtual properties
  get displayName(): string {
    if (this.customName) {
      return this.customName;
    }
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

  get isElectric(): boolean {
    return this.fuelType === "electric" || this.fuelType === "hybrid";
  }

  get emissionFactorFormatted(): string {
    return `${this.emissionFactor} kg CO₂/km`;
  }

  get ageInYears(): number {
    if (!this.year) return 0;
    return new Date().getFullYear() - this.year;
  }

  get isNewVehicle(): boolean {
    return this.ageInYears <= 1;
  }

  get hasInsurance(): boolean {
    return !!(this.insuranceInfo?.provider && this.insuranceInfo?.policyNumber);
  }

  get isInsuranceExpired(): boolean {
    if (!this.insuranceInfo?.expiryDate) return false;
    return new Date(this.insuranceInfo.expiryDate) < new Date();
  }

  get needsMaintenance(): boolean {
    if (!this.maintenanceInfo?.nextServiceDate) return false;
    const nextService = new Date(this.maintenanceInfo.nextServiceDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return nextService <= thirtyDaysFromNow;
  }
}
