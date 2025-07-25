import { IsString, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class AdminLoginDto {
  @ApiProperty({
    description: "Admin username",
    example: "admin",
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: "Admin password",
    example: "admin123",
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
