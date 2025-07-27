import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsBoolean,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class CycleInfoResponseDto {
  @ApiProperty({ description: "Allocation amount for the cycle" })
  allocation: number;

  @ApiProperty({ description: "Amount distributed in the cycle" })
  distributed: number;

  @ApiProperty({ description: "Remaining amount in the cycle" })
  remaining: number;
}

export class UserDataResponseDto {
  @ApiProperty({ description: "Last miles recorded for the user" })
  lastMiles: number;

  @ApiProperty({ description: "Last submission date timestamp" })
  lastSubmissionDate: number;

  @ApiProperty({ description: "User carbon footprint" })
  carbonFootprint: number;

  @ApiProperty({ description: "Whether user exists in the contract" })
  exists: boolean;
}

export class GlobalStatsResponseDto {
  @ApiProperty({ description: "Total carbon saved across all users" })
  totalCarbon: number;

  @ApiProperty({ description: "Total miles driven across all users" })
  totalMilesDriven: number;

  @ApiProperty({ description: "Total number of users joined" })
  usersJoined: number;

  @ApiProperty({ description: "Total rewards distributed" })
  totalRewardDistributed: number;

  @ApiProperty({ description: "Current cycle number" })
  currentCycle: number;
}

export class BatchRewardInputDto {
  @ApiProperty({ description: "User wallet address" })
  @IsString()
  user: string;

  @ApiProperty({ description: "Miles driven by the user" })
  @IsNumber()
  miles: number;

  @ApiProperty({ description: "Reward amount in B3TR tokens" })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: "Types of proof provided", type: [String] })
  @IsArray()
  @IsString({ each: true })
  proofTypes: string[];

  @ApiProperty({ description: "Values of proof provided", type: [String] })
  @IsArray()
  @IsString({ each: true })
  proofValues: string[];

  @ApiProperty({ description: "Impact codes", type: [String] })
  @IsArray()
  @IsString({ each: true })
  impactCodes: string[];

  @ApiProperty({ description: "Impact values", type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  impactValues: number[];

  @ApiProperty({ description: "Description of the reward" })
  @IsString()
  description: string;
}

export class DistributeRewardsDto {
  @ApiProperty({
    description: "Batch of reward data",
    type: [BatchRewardInputDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchRewardInputDto)
  batchData: BatchRewardInputDto[];
}

export class DistributeRewardsResponseDto {
  @ApiProperty({ description: "Transaction ID" })
  txid: string;

  @ApiProperty({ description: "Total amount distributed" })
  totalDistributed: number;

  @ApiProperty({ description: "Number of batches processed" })
  batchCount: number;

  @ApiProperty({ description: "Total number of users" })
  totalUsers: number;
}

export class SetRewardForActiveChallengeResponseDto {
  @ApiProperty({ description: "Transaction ID" })
  txid: string;

  @ApiProperty({ description: "Challenge ID" })
  challengeId: string;

  @ApiProperty({ description: "Reward amount set" })
  rewardAmount: number;

  @ApiProperty({ description: "Success message" })
  message: string;
}

export class SetRewardForCycleDto {
  @ApiProperty({ description: "Reward amount to set for the cycle" })
  @IsNumber()
  rewardAmount: number;
}

export class TransactionReceiptResponseDto {
  @ApiProperty({ description: "Transaction ID" })
  txid: string;

  @ApiProperty({ description: "Whether transaction was reverted" })
  reverted: boolean;

  @ApiProperty({ description: "Gas used for the transaction" })
  gasUsed: number;

  @ApiProperty({ description: "Block number where transaction was included" })
  blockNumber: number;
}

export class GasPriceResponseDto {
  @ApiProperty({ description: "Slow gas price" })
  slow: number;

  @ApiProperty({ description: "Standard gas price" })
  standard: number;

  @ApiProperty({ description: "Fast gas price" })
  fast: number;
}

export class NetworkHealthResponseDto {
  @ApiProperty({ description: "Network status" })
  status: string;

  @ApiProperty({ description: "Current block height" })
  blockHeight: number;

  @ApiProperty({ description: "Last block time" })
  lastBlockTime: Date;

  @ApiProperty({ description: "Average block time in seconds" })
  averageBlockTime: number;

  @ApiProperty({ description: "Number of active validators" })
  activeValidators: number;

  @ApiProperty({ description: "Total amount staked" })
  totalStaked: number;

  @ApiProperty({ description: "Network load percentage" })
  networkLoad: number;

  @ApiProperty({ description: "Gas prices", type: GasPriceResponseDto })
  gasPrice: GasPriceResponseDto;
}

export class ServiceStatusResponseDto {
  @ApiProperty({ description: "Whether VeChain service is initialized" })
  isInitialized: boolean;

  @ApiProperty({ description: "Admin wallet address" })
  adminAddress: string;

  @ApiProperty({ description: "Contract address" })
  contractAddress: string;

  @ApiProperty({ description: "Network (mainnet/testnet)" })
  network: string;

  @ApiProperty({ description: "Node URL" })
  nodeUrl: string;
}
