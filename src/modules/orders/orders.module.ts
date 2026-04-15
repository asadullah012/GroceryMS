import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Order } from "./entities/order.entity";
import { OrderItem } from "./entities/orderItem.entity";
import { GroceryItem } from "../grocery/entities/groceryItem.entity";
import { OrdersService } from "./services/orders.service";
import { OrdersController } from "./controllers/orders.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, GroceryItem])],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
