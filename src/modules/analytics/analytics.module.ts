import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AnalyticsController } from "./controllers/analytics.controller";
import { AnalyticsService } from "./services/analytics.service";
import { User } from "../users/entity/user.entity";
import { Vehicle } from "../vehicles/entity/vehicle.entity";
import { OdometerUpload } from "../odometer/entity/odometer-upload.entity";
import { Reward } from "../rewards/entity/reward.entity";
import { Leaderboard } from "../leaderboard/entity/leaderboard.entity";
import { History } from "../history/entity/history.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Vehicle,
      OdometerUpload,
      Reward,
      Leaderboard,
      History,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
