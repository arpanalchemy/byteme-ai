import { IsString, IsNotEmpty, IsOptional, IsObject } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class VerifySignatureDto {
  @ApiProperty({
    description: "Wallet address",
    example: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  })
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @ApiProperty({
    description:
      "Message that was signed (required for legacy signature verification)",
    example: "Sign this message to authenticate with Drive & Earn: 1234567890",
    required: false,
  })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiProperty({
    description:
      "Signature of the message (required for legacy signature verification)",
    example: "0x1234567890abcdef...",
    required: false,
  })
  @IsString()
  @IsOptional()
  signature?: string;

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
    required: false,
  })
  @IsObject()
  @IsOptional()
  certificate?: {
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
}
