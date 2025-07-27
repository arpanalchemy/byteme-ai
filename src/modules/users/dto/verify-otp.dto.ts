import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Length } from "class-validator";

export class VerifyOtpDto {
  @ApiProperty({
    description: "User email address",
    example: "user@example.com",
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: "Six-digit OTP code sent to email",
    example: "123456",
  })
  @IsString()
  @Length(6, 6, { message: "OTP must be exactly 6 digits" })
  otp: string;
}
