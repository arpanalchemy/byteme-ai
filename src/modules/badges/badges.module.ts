import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  BadgeController,
  UserBadgeController,
  AdminBadgeController,
} from "./controllers/badge.controller";
import { BadgeService } from "./services/badge.service";
import { Badge } from "./entity/badge.entity";
import { UserBadge } from "./entity/user-badge.entity";
import { User } from "../users/entity/user.entity";
import { Vehicle } from "../vehicles/entity/vehicle.entity";
import { OdometerUpload } from "../odometer/entity/odometer-upload.entity";
import { Reward } from "../rewards/entity/reward.entity";
import { RewardService } from "../rewards/services/reward.service";
import { VeChainService } from "../../common/blockchain/vechain.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Badge,
      UserBadge,
      User,
      Vehicle,
      OdometerUpload,
      Reward,
    ]),
  ],
  controllers: [BadgeController, UserBadgeController, AdminBadgeController],
  providers: [BadgeService, RewardService, VeChainService],
  exports: [BadgeService],
})
export class BadgesModule {}
