import { Test, TestingModule } from "@nestjs/testing";
import { OrdersController } from "../../src/modules/orders/controllers/orders.controller";
import { OrdersService } from "../../src/modules/orders/services/orders.service";
import { CreateOrderDto } from "../../src/modules/orders/dto/create-order.dto";

describe("OrdersController", () => {
  let controller: OrdersController;
  let ordersService: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: {
            create: jest.fn(),
            findByUser: jest.fn(),
            cancel: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    ordersService = module.get<OrdersService>(OrdersService);
  });

  describe("create", () => {
    it("should create a new order", async () => {
      const createOrderDto: CreateOrderDto = {
        items: [{ grocery_item_id: "uuid-1", quantity: 2 }],
      };

      const mockOrder = {
        id: "order-uuid",
        status: "confirmed",
        totalPrice: 9.98,
        userId: "user-uuid",
        createdAt: new Date(),
        items: [],
      };

      ordersService.create = jest.fn().mockResolvedValue(mockOrder);

      const mockReq = { user: { userId: "user-uuid" } } as any;
      const result = await controller.create(createOrderDto, mockReq);

      expect(result).toEqual(mockOrder);
    });
  });

  describe("findMyOrders", () => {
    it("should return user's orders", async () => {
      const mockOrders = {
        data: [
          {
            id: "order-uuid",
            status: "confirmed",
            totalPrice: 9.98,
            createdAt: new Date(),
            items: [],
          },
        ],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };

      ordersService.findByUser = jest.fn().mockResolvedValue(mockOrders);

      const mockReq = { user: { userId: "user-uuid" } } as any;
      const result = await controller.findMyOrders(mockReq, 1, 10);

      expect(result).toEqual(mockOrders);
    });

    it("should filter orders by status", async () => {
      const mockOrders = {
        data: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };

      ordersService.findByUser = jest.fn().mockResolvedValue(mockOrders);

      const mockReq = { user: { userId: "user-uuid" } } as any;
      const result = await controller.findMyOrders(mockReq, 1, 10, "confirmed");

      expect(result).toEqual(mockOrders);
    });
  });

  describe("cancel", () => {
    it("should cancel an order", async () => {
      const mockResponse = { message: "Order cancelled successfully" };

      ordersService.cancel = jest.fn().mockResolvedValue(mockResponse);

      const mockReq = { user: { userId: "user-uuid" } } as any;
      const result = await controller.cancel("order-uuid", mockReq);

      expect(result).toEqual(mockResponse);
    });
  });
});
