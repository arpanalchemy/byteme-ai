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

  @OneToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ name: "encrypted_mnemonic", type: "text", nullable: true })
  encryptedMnemonic: string;

  @Column({ name: "encrypted_private_key", type: "text", nullable: true })
  encryptedPrivateKey: string;

  @Column({ name: "encrypted_public_key", type: "text", nullable: true })
  encryptedPublicKey: string;

  @Column({ name: "wallet_address", type: "text", nullable: true })
  walletAddress: string;

  @Column({ name: "wallet_type", type: "varchar", length: 50, nullable: true })
  walletType: string;

  @Column({ name: "mnemonic_iv", type: "text", nullable: true })
  mnemonicIv: string; // IV for mnemonic encryption

  @Column({ name: "mnemonic_salt", type: "text", nullable: true })
  mnemonicSalt: string; // Salt for mnemonic encryption

  @Column({ name: "private_key_iv", type: "text", nullable: true })
  privateKeyIv: string; // IV for private key encryption

  @Column({ name: "private_key_salt", type: "text", nullable: true })
  privateKeySalt: string; // Salt for private key encryption

  @Column({ name: "public_key_iv", type: "text", nullable: true })
  publicKeyIv: string; // IV for public key encryption

  @Column({ name: "public_key_salt", type: "text", nullable: true })
  publicKeySalt: string; // Salt for public key encryption

  @Column({ name: "is_backed_up", type: "boolean", default: false })
  isBackedUp: boolean; // Whether user has backed up their wallet

  @Column({ name: "backed_up_at", type: "timestamp", nullable: true })
  backedUpAt: Date;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
