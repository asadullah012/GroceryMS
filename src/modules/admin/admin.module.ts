import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../users/entities/user.entity";
import { GroceryItem } from "../grocery/entities/groceryItem.entity";
import { AdminUsersService } from "./services/admin-users.service";
import { AdminGroceryService } from "./services/admin-grocery.service";
import { AdminUsersController } from "./controllers/admin-users.controller";
import { AdminGroceryController } from "./controllers/admin-grocery.controller";

@Module({
  imports: [TypeOrmModule.forFeature([User, GroceryItem])],
  controllers: [AdminUsersController, AdminGroceryController],
  providers: [AdminUsersService, AdminGroceryService],
})
export class AdminModule {}
