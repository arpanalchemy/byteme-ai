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
import { HistoryModule } from "../history/history.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Reward, User]),
    ScheduleModule.forRoot(),
    HistoryModule,
  ],
  controllers: [RewardController, AdminRewardController],
  providers: [RewardService, VeChainService],
  exports: [RewardService],
})
export class RewardsModule {}
