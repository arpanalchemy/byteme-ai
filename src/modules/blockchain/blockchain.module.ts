import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BlockchainController } from "./controllers/blockchain.controller";
import { BlockchainService } from "./services/blockchain.service";
import { User } from "../users/entity/user.entity";
import { Reward } from "../rewards/entity/reward.entity";
import { UserWallet } from "../users/entity/user-wallet.entity";
import { SmartContractService } from "./services/smart-contract.service";
import { CarbonCreditService } from "./services/carbon-credit.service";
import { VeChainService } from "../../common/blockchain/vechain.service";

@Module({
  imports: [TypeOrmModule.forFeature([User, Reward, UserWallet])],
  controllers: [BlockchainController],
  providers: [
    BlockchainService,
    VeChainService,
    CarbonCreditService,
    SmartContractService,
  ],
  exports: [
    BlockchainService,
    VeChainService,
    CarbonCreditService,
    SmartContractService,
  ],
})
export class BlockchainModule {}
