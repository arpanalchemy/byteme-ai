import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { VehicleController } from "./controllers/vehicle.controller";
import { VehicleService } from "./services/vehicle.service";
import { Vehicle } from "./entity/vehicle.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle])],
  controllers: [VehicleController],
  providers: [VehicleService],
  exports: [VehicleService],
})
export class VehiclesModule {}
