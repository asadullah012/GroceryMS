import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  DefaultValuePipe,
  ParseIntPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
  ApiParam,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { UserRole } from "../../users/entities/user.entity";
import { AdminGroceryService } from "../services/admin-grocery.service";
import {
  CreateGroceryItemDto,
  UpdateGroceryItemDto,
  UpdateInventoryDto,
} from "../dto/admin-grocery.dto";

@ApiTags("Admin - Grocery")
@ApiBearerAuth()
@Controller("admin/items")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminGroceryController {
  constructor(private readonly adminGroceryService: AdminGroceryService) {}

  @Get()
  @ApiOperation({ summary: "List all grocery items (admin view)" })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Page number (default: 1)",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Items per page (default: 10)",
  })
  @ApiResponse({
    status: 200,
    description: "Returns paginated list including inactive items",
  })
  findAll(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ) {
    return this.adminGroceryService.findAll(page, limit);
  }

  @Post()
  @ApiOperation({ summary: "Create a new grocery item" })
  @ApiResponse({ status: 201, description: "Item created successfully" })
  @ApiResponse({ status: 400, description: "Invalid item data" })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createGroceryItemDto: CreateGroceryItemDto) {
    return this.adminGroceryService.create(createGroceryItemDto);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a grocery item" })
  @ApiParam({ name: "id", description: "Item ID (UUID)" })
  @ApiResponse({ status: 200, description: "Item updated successfully" })
  @ApiResponse({ status: 404, description: "Item not found" })
  @ApiResponse({
    status: 422,
    description: "Cannot reduce inventory below reserved quantity",
  })
  update(
    @Param("id") id: string,
    @Body() updateGroceryItemDto: UpdateGroceryItemDto,
  ) {
    return this.adminGroceryService.update(id, updateGroceryItemDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Soft delete a grocery item" })
  @ApiParam({ name: "id", description: "Item ID (UUID)" })
  @ApiResponse({ status: 204, description: "Item deleted successfully" })
  @ApiResponse({ status: 404, description: "Item not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param("id") id: string) {
    return this.adminGroceryService.delete(id);
  }

  @Patch(":id/inventory")
  @ApiOperation({ summary: "Update inventory count" })
  @ApiParam({ name: "id", description: "Item ID (UUID)" })
  @ApiResponse({ status: 200, description: "Inventory updated successfully" })
  @ApiResponse({ status: 400, description: "Invalid inventory value" })
  @ApiResponse({
    status: 422,
    description: "Cannot reduce below reserved quantity",
  })
  updateInventory(
    @Param("id") id: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ) {
    return this.adminGroceryService.updateInventory(
      id,
      updateInventoryDto.inventoryCount,
    );
  }
}
