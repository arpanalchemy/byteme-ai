import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BlockchainController } from "./controllers/blockchain.controller";
import { VeChainController } from "./controllers/vechain.controller";
import { BlockchainService } from "./services/blockchain.service";
import { User } from "../users/entity/user.entity";
import { Reward } from "../rewards/entity/reward.entity";
import { UserWallet } from "../users/entity/user-wallet.entity";
import { SmartContractService } from "./services/smart-contract.service";
import { CarbonCreditService } from "./services/carbon-credit.service";
import { VeChainService } from "../../common/blockchain/vechain.service";
import { ChallengeService } from "../challenges/services/challenge.service";
import { Challenge } from "../challenges/entity/challenge.entity";
import { UserChallenge } from "../challenges/entity/user-challenge.entity";
import { Vehicle } from "../vehicles/entity/vehicle.entity";
import { OdometerUpload } from "../odometer/entity/odometer-upload.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Reward,
      UserWallet,
      Challenge,
      UserChallenge,
      Vehicle,
      OdometerUpload,
    ]),
  ],
  controllers: [BlockchainController, VeChainController],
  providers: [
    BlockchainService,
    VeChainService,
    CarbonCreditService,
    SmartContractService,
    ChallengeService,
  ],
  exports: [
    BlockchainService,
    VeChainService,
    CarbonCreditService,
    SmartContractService,
    ChallengeService,
  ],
})
export class BlockchainModule {}
