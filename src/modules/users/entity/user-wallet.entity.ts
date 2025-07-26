import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";

@Entity("user_wallets")
export class UserWallet {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid", unique: true })
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ type: "text", nullable: true })
  encryptedMnemonic: string;

  @Column({ type: "text", nullable: true })
  encryptedPrivateKey: string;

  @Column({ type: "text", nullable: true })
  encryptedPublicKey: string;

  @Column({ type: "text", nullable: true })
  walletAddress: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  walletType: string;

  @Column({ type: "text", nullable: true })
  mnemonicIv: string; // IV for mnemonic encryption

  @Column({ type: "text", nullable: true })
  mnemonicSalt: string; // Salt for mnemonic encryption

  @Column({ type: "text", nullable: true })
  privateKeyIv: string; // IV for private key encryption

  @Column({ type: "text", nullable: true })
  privateKeySalt: string; // Salt for private key encryption

  @Column({ type: "text", nullable: true })
  publicKeyIv: string; // IV for public key encryption

  @Column({ type: "text", nullable: true })
  publicKeySalt: string; // Salt for public key encryption

  @Column({ type: "boolean", default: false })
  isBackedUp: boolean; // Whether user has backed up their wallet

  @Column({ type: "timestamp", nullable: true })
  backedUpAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
