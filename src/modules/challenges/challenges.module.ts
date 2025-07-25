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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Challenge,
      UserChallenge,
      User,
      Vehicle,
      OdometerUpload,
    ]),
  ],
  controllers: [
    ChallengeController,
    UserChallengeController,
    AdminChallengeController,
  ],
  providers: [ChallengeService],
  exports: [ChallengeService],
})
export class ChallengesModule {}
