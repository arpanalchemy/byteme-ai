import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  StoreController,
  AdminStoreController,
} from "./controllers/store.controller";
import { StoreService } from "./services/store.service";
import { Product } from "./entity/product.entity";
import { Order } from "./entity/order.entity";
import { User } from "../users/entity/user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Product, Order, User])],
  controllers: [StoreController, AdminStoreController],
  providers: [StoreService],
  exports: [StoreService],
})
export class StoreModule {}
