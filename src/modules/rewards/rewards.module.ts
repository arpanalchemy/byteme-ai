import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScheduleModule } from "@nestjs/schedule";
import {
  RewardController,
  AdminRewardController,
} from "./controllers/reward.controller";
import { RewardService } from "./services/reward.service";
import { Reward } from "./entity/reward.entity";
import { User } from "../users/entity/user.entity";
import { VeChainService } from "../../common/blockchain/vechain.service";

@Module({
  imports: [TypeOrmModule.forFeature([Reward, User]), ScheduleModule.forRoot()],
  controllers: [RewardController, AdminRewardController],
  providers: [RewardService, VeChainService],
  exports: [RewardService],
})
export class RewardsModule {}
