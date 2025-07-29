import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OdometerController } from "./controllers/odometer.controller";
import { OdometerService } from "./services/odometer.service";
import { OdometerUpload } from "./entity/odometer-upload.entity";
import { Vehicle } from "../vehicles/entity/vehicle.entity";
import { User } from "../users/entity/user.entity";
import { History } from "../history/entity/history.entity";
import { Reward } from "../rewards/entity/reward.entity";
import { S3Service } from "../../common/upload/s3.service";
import { OpenAIService } from "../../common/ai/openai.service";
import { RedisService } from "../../common/cache/redis.service";
import { AwsTextractService } from "../../common/ocr/aws-textract.service";

import { VehicleService } from "../vehicles/services/vehicle.service";
import { HistoryService } from "../history/services/history.service";
import { RewardService } from "../rewards/services/reward.service";
import { VeChainService } from "../../common/blockchain/vechain.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([OdometerUpload, Vehicle, User, History, Reward]),
  ],
  controllers: [OdometerController],
  providers: [
    OdometerService,
    VehicleService,
    HistoryService,
    RewardService,
    VeChainService,
    S3Service,
    OpenAIService,
    RedisService,
    AwsTextractService,
  ],
  exports: [OdometerService],
})
export class OdometerModule {}
