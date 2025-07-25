import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OdometerController } from './controllers/odometer.controller';
import { OdometerService } from './services/odometer.service';
import { OdometerUpload } from './entity/odometer-upload.entity';
import { Vehicle } from '../vehicles/entity/vehicle.entity';
import { User } from '../users/entity/user.entity';
import { S3Service } from '../../common/upload/s3.service';
import { OpenAIService } from '../../common/ai/openai.service';
import { RedisService } from '../../common/cache/redis.service';

import { VehicleService } from "../vehicles/services/vehicle.service";

@Module({
  imports: [TypeOrmModule.forFeature([OdometerUpload, Vehicle, User])],
  controllers: [OdometerController],
  providers: [
    OdometerService,
    VehicleService,
    S3Service,
    OpenAIService,
    RedisService,
  ],
  exports: [OdometerService],
})
export class OdometerModule {}
