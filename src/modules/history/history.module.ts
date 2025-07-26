import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  HistoryController,
  AdminHistoryController,
} from "./controllers/history.controller";
import { HistoryService } from "./services/history.service";
import { History } from "./entity/history.entity";
import { User } from "../users/entity/user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([History, User])],
  controllers: [HistoryController, AdminHistoryController],
  providers: [HistoryService],
  exports: [HistoryService],
})
export class HistoryModule {}
