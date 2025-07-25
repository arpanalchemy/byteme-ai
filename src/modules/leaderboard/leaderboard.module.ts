import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LeaderboardController } from "./controllers/leaderboard.controller";
import { LeaderboardService } from "./services/leaderboard.service";
import { Leaderboard } from "./entity/leaderboard.entity";
import { User } from "../users/entity/user.entity";
import { OdometerUpload } from "../odometer/entity/odometer-upload.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Leaderboard, User, OdometerUpload])],
  controllers: [LeaderboardController],
  providers: [LeaderboardService],
  exports: [LeaderboardService],
})
export class LeaderboardModule {}
