import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  username?: string;

  @Column({ nullable: true })
  email?: string;

  @Index({ unique: true })
  @Column({ name: 'wallet_address', unique: true, nullable: true })
  walletAddress?: string;

  @Column({ name: 'wallet_type', nullable: true })
  walletType?: 'veworld' | 'sync2' | 'walletconnect';

  @Column({ name: 'nonce', nullable: true })
  nonce?: string;

  @Column({ name: 'email_otp', nullable: true })
  emailOtp?: string;

  @Column({ name: 'last_login', nullable: true })
  lastLogin?: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'profile_image_url', nullable: true })
  profileImageUrl?: string;

  @Column({
    name: 'total_mileage',
    default: 0,
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  totalMileage: number;

  @Column({
    name: 'total_carbon_saved',
    default: 0,
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  totalCarbonSaved: number;

  @Column({ name: 'total_points', default: 0 })
  totalPoints: number;

  @Column({ name: 'current_tier', default: 'bronze' })
  currentTier: 'bronze' | 'silver' | 'gold' | 'platinum';

  @Column({
    name: 'b3tr_balance',
    default: 0,
    type: 'decimal',
    precision: 18,
    scale: 6,
  })
  b3trBalance: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Virtual properties for JWT payload
  @Exclude()
  get jwtPayload() {
    return {
      sub: this.id,
      walletAddress: this.walletAddress || null,
      isActive: this.isActive,
      isVerified: this.isVerified,
    };
  }
}
