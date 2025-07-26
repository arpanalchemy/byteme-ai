import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  NotificationController,
  AdminNotificationController,
} from "./controllers/notification.controller";
import { NotificationService } from "./services/notification.service";
import { Notification } from "./entity/notification.entity";
import { User } from "../users/entity/user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Notification, User])],
  controllers: [NotificationController, AdminNotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationsModule {}
