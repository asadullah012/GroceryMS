import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GroceryItem } from "./entities/groceryItem.entity";
import { GroceryService } from "./services/grocery.service";
import { GroceryController } from "./controllers/grocery.controller";

@Module({
  imports: [TypeOrmModule.forFeature([GroceryItem])],
  controllers: [GroceryController],
  providers: [GroceryService],
  exports: [GroceryService],
})
export class GroceryModule {}
