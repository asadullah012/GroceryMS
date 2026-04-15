import {
  Controller,
  Get,
  Query,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { GroceryService } from "./grocery.service";

@ApiTags("Grocery")
@ApiBearerAuth()
@Controller("items")
@UseGuards(JwtAuthGuard)
export class GroceryController {
  constructor(private readonly groceryService: GroceryService) {}

  @Get()
  @ApiOperation({ summary: "List available grocery items" })
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
  @ApiQuery({
    name: "search",
    required: false,
    type: String,
    description: "Search by item name (case-insensitive)",
  })
  @ApiResponse({ status: 200, description: "Returns paginated grocery items" })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - invalid or missing token",
  })
  findAll(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit = 10,
    @Query("search") search?: string,
  ) {
    return this.groceryService.findAll(page, limit, search);
  }
}
