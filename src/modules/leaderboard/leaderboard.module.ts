import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LeaderboardController } from "./controllers/leaderboard.controller";
import { LeaderboardService } from "./services/leaderboard.service";
import { Leaderboard } from "./entity/leaderboard.entity";
import { User } from "../users/entity/user.entity";
import { OdometerUpload } from "../odometer/entity/odometer-upload.entity";
import { UserChallenge } from "../challenges/entity/user-challenge.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Leaderboard,
      User,
      OdometerUpload,
      UserChallenge,
    ]),
  ],
  controllers: [LeaderboardController],
  providers: [LeaderboardService],
  exports: [LeaderboardService],
})
export class LeaderboardModule {}
