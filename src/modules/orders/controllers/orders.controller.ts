import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
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
import { OrdersService } from "../services/orders.service";
import { CreateOrderDto } from "../dto/create-order.dto";
import { OrderStatus } from "../entities/order.entity";
import { Request } from "express";

interface AuthenticatedRequest extends Request {
  user: { userId: string; email: string; role: string };
}

@ApiTags("Orders")
@ApiBearerAuth()
@Controller("orders")
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: "Create a new order" })
  @ApiResponse({ status: 201, description: "Order created successfully" })
  @ApiResponse({ status: 400, description: "Invalid order data" })
  @ApiResponse({ status: 422, description: "Insufficient inventory" })
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createOrderDto: CreateOrderDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.ordersService.create(createOrderDto, req.user.userId);
  }

  private static readonly MAX_LIMIT = 100;

  @Get("my")
  @ApiOperation({ summary: "Get current user's orders" })
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
    description: "Items per page (default: 10, max: 100)",
  })
  @ApiQuery({
    name: "status",
    required: false,
    type: String,
    description: "Filter by status: confirmed, cancelled",
  })
  @ApiResponse({ status: 200, description: "Returns user's order history" })
  findMyOrders(
    @Req() req: AuthenticatedRequest,
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit = 10,
    @Query("status") status?: string,
  ) {
    const cappedLimit = Math.min(limit, OrdersController.MAX_LIMIT);
    const orderStatus = status ? (status as OrderStatus) : undefined;
    return this.ordersService.findByUser(
      req.user.userId,
      page,
      cappedLimit,
      orderStatus,
    );
  }

  @Delete(":id")
  @ApiOperation({ summary: "Cancel an order" })
  @ApiParam({ name: "id", description: "Order ID (UUID)" })
  @ApiResponse({ status: 200, description: "Order cancelled successfully" })
  @ApiResponse({ status: 403, description: "Not your order" })
  @ApiResponse({ status: 404, description: "Order not found" })
  @ApiResponse({ status: 422, description: "Order already cancelled" })
  @HttpCode(HttpStatus.OK)
  cancel(@Param("id") orderId: string, @Req() req: AuthenticatedRequest) {
    return this.ordersService.cancel(orderId, req.user.userId);
  }
}
