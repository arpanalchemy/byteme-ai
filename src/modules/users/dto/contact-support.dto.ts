import { IsEmail, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export enum SupportCategory {
  GENERAL_INQUIRY = "General Inquiry",
  TECHNICAL_SUPPORT = "Technical Support",
  BILLING_PAYMENTS = "Billing & Payments",
  REWARDS_TOKENS = "Rewards & Tokens",
  UPLOAD_ISSUES = "Upload Issues",
  WALLET_CONNECTION = "Wallet Connection",
}

export class ContactSupportDto {
  @ApiProperty({ enum: SupportCategory })
  @IsNotEmpty()
  @IsEnum(SupportCategory)
  category: SupportCategory;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  emailAddress: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  subject: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  message: string;
}
