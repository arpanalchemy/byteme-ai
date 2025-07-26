import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsObject,
  IsIn,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class VerifySignatureDto {
  @ApiProperty({
    description: "VeChain Certificate for authentication (new method)",
    example: {
      purpose: "identification",
      payload: {
        type: "text",
        content: "054971554de3f7404839a85e620203ec",
      },
      signature:
        "0x208934bfae48767ac71ba0804c80e6e4de963c564b9debb886d1527a2b6a1c3d0ea4a11cd8f3bb0a9c3450426bd6625f5c0c537d0aebd7cb9fb76f27a211562e01",
      signer: "0x595c73ec5279a3833ba535753bfd762da6bbac1d",
      domain: "localhost:3000",
      timestamp: 1753430586,
    },
    required: true,
  })
  @IsObject()
  certificate: {
    purpose: string;
    payload: {
      type: string;
      content: string;
    };
    signature: string;
    signer: string;
    domain: string;
    timestamp: number;
  };

  @ApiPropertyOptional({
    description: "Type of wallet being connected",
    enum: ["veworld", "sync2", "walletconnect"],
    example: "veworld",
  })
  @IsOptional()
  @IsString()
  @IsIn(["veworld", "sync2", "walletconnect"])
  walletType?: "veworld" | "sync2" | "walletconnect";

  @ApiPropertyOptional({
    description: "Username for the account (optional)",
    example: "john_doe",
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    description: "Email address (optional)",
    example: "john@example.com",
  })
  @IsOptional()
  @IsString()
  email?: string;
}
