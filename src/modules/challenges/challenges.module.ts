import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  ChallengeController,
  UserChallengeController,
  AdminChallengeController,
} from "./controllers/challenge.controller";
import { ChallengeService } from "./services/challenge.service";
import { Challenge } from "./entity/challenge.entity";
import { UserChallenge } from "./entity/user-challenge.entity";
import { User } from "../users/entity/user.entity";
import { Vehicle } from "../vehicles/entity/vehicle.entity";
import { OdometerUpload } from "../odometer/entity/odometer-upload.entity";
import { Reward } from "../rewards/entity/reward.entity";
import { RewardService } from "../rewards/services/reward.service";
import { VeChainService } from "../../common/blockchain/vechain.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Challenge,
      UserChallenge,
      User,
      Vehicle,
      OdometerUpload,
      Reward,
    ]),
  ],
  controllers: [
    ChallengeController,
    UserChallengeController,
    AdminChallengeController,
  ],
  providers: [ChallengeService, RewardService, VeChainService],
  exports: [ChallengeService],
})
export class ChallengesModule {}
