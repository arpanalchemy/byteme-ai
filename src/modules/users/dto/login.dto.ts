import { IsEmail, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({
    example: "user@example.com",
    description: "Registered email address of the user",
    required: true,
    type: String,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
