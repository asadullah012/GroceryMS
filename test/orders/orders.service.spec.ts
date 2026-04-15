import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DataSource, Repository, SelectQueryBuilder } from "typeorm";
import { OrdersService } from "../../src/modules/orders/services/orders.service";
import {
  Order,
  OrderStatus,
} from "../../src/modules/orders/entities/order.entity";
import { OrderItem } from "../../src/modules/orders/entities/orderItem.entity";
import { GroceryItem } from "../../src/modules/grocery/entities/groceryItem.entity";
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";

describe("OrdersService", () => {
  let service: OrdersService;
  let mockDataSource: any;

  beforeEach(async () => {
    const mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        findOne: jest.fn(),
        create: jest.fn().mockImplementation((entity: any, data: any) => ({
          ...data,
          id: "test-id",
        })),
        save: jest
          .fn()
          .mockImplementation((entity: any) => Promise.resolve(entity)),
      },
    };

    mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            createQueryBuilder: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: { find: jest.fn() },
        },
        {
          provide: getRepositoryToken(GroceryItem),
          useValue: { findOne: jest.fn(), save: jest.fn() },
        },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  describe("create", () => {
    it("should throw NotFoundException when grocery item not found", async () => {
      const mockQueryRunner = mockDataSource.createQueryRunner();
      mockQueryRunner.manager.findOne.mockResolvedValue(null);

      const createOrderDto = {
        items: [{ grocery_item_id: "non-existent", quantity: 1 }],
      };

      await expect(service.create(createOrderDto, "user-id")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw BadRequestException when insufficient inventory", async () => {
      const mockQueryRunner = mockDataSource.createQueryRunner();
      mockQueryRunner.manager.findOne.mockResolvedValue({
        id: "uuid-1",
        name: "Apple",
        price: 4.99,
        inventoryCount: 0,
      });

      const createOrderDto = {
        items: [{ grocery_item_id: "uuid-1", quantity: 5 }],
      };

      await expect(service.create(createOrderDto, "user-id")).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("findOne", () => {
    it("should return an order by id", async () => {
      const mockOrder = {
        id: "order-id",
        status: OrderStatus.CONFIRMED,
        totalPrice: 9.98,
        userId: "user-id",
        createdAt: new Date(),
        items: [],
      };

      const mockRepository: any = {
        findOne: jest.fn().mockResolvedValue(mockOrder),
      };

      const module = await Test.createTestingModule({
        providers: [
          OrdersService,
          { provide: getRepositoryToken(Order), useValue: mockRepository },
          {
            provide: getRepositoryToken(OrderItem),
            useValue: { find: jest.fn() },
          },
          {
            provide: getRepositoryToken(GroceryItem),
            useValue: { findOne: jest.fn() },
          },
          { provide: DataSource, useValue: mockDataSource },
        ],
      }).compile();

      const testService = module.get<OrdersService>(OrdersService);
      const result = await testService.findOne("order-id");

      expect(result).toBeDefined();
      expect(result.id).toBe("order-id");
    });

    it("should throw NotFoundException when order not found", async () => {
      const mockRepository: any = {
        findOne: jest.fn().mockResolvedValue(null),
      };

      const module = await Test.createTestingModule({
        providers: [
          OrdersService,
          { provide: getRepositoryToken(Order), useValue: mockRepository },
          {
            provide: getRepositoryToken(OrderItem),
            useValue: { find: jest.fn() },
          },
          {
            provide: getRepositoryToken(GroceryItem),
            useValue: { findOne: jest.fn() },
          },
          { provide: DataSource, useValue: mockDataSource },
        ],
      }).compile();

      const testService = module.get<OrdersService>(OrdersService);
      await expect(testService.findOne("non-existent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("cancel", () => {
    it("should throw NotFoundException when order not found", async () => {
      const mockRepository: any = {
        findOne: jest.fn().mockResolvedValue(null),
      };

      const module = await Test.createTestingModule({
        providers: [
          OrdersService,
          { provide: getRepositoryToken(Order), useValue: mockRepository },
          {
            provide: getRepositoryToken(OrderItem),
            useValue: { find: jest.fn() },
          },
          {
            provide: getRepositoryToken(GroceryItem),
            useValue: { findOne: jest.fn(), save: jest.fn() },
          },
          { provide: DataSource, useValue: mockDataSource },
        ],
      }).compile();

      const testService = module.get<OrdersService>(OrdersService);
      await expect(
        testService.cancel("non-existent", "user-id"),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException when not the order owner", async () => {
      const mockOrder = {
        id: "order-id",
        userId: "other-user",
        status: OrderStatus.CONFIRMED,
        items: [],
      };

      const testMockQueryRunner = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        manager: {
          findOne: jest.fn().mockResolvedValue(mockOrder),
          save: jest.fn(),
        },
      };

      const testMockDataSource = {
        createQueryRunner: jest.fn().mockReturnValue(testMockQueryRunner),
      };

      const module = await Test.createTestingModule({
        providers: [
          OrdersService,
          {
            provide: getRepositoryToken(Order),
            useValue: { findOne: jest.fn() },
          },
          {
            provide: getRepositoryToken(OrderItem),
            useValue: { find: jest.fn() },
          },
          {
            provide: getRepositoryToken(GroceryItem),
            useValue: { findOne: jest.fn(), save: jest.fn() },
          },
          { provide: DataSource, useValue: testMockDataSource },
        ],
      }).compile();

      const testService = module.get<OrdersService>(OrdersService);
      await expect(testService.cancel("order-id", "user-id")).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("should throw BadRequestException when order already cancelled", async () => {
      const mockOrder = {
        id: "order-id",
        userId: "user-id",
        status: OrderStatus.CANCELLED,
        items: [],
      };

      const testMockQueryRunner = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        manager: {
          findOne: jest.fn().mockResolvedValue(mockOrder),
          save: jest.fn(),
        },
      };

      const testMockDataSource = {
        createQueryRunner: jest.fn().mockReturnValue(testMockQueryRunner),
      };

      const module = await Test.createTestingModule({
        providers: [
          OrdersService,
          {
            provide: getRepositoryToken(Order),
            useValue: { findOne: jest.fn() },
          },
          {
            provide: getRepositoryToken(OrderItem),
            useValue: { find: jest.fn() },
          },
          {
            provide: getRepositoryToken(GroceryItem),
            useValue: { findOne: jest.fn(), save: jest.fn() },
          },
          { provide: DataSource, useValue: testMockDataSource },
        ],
      }).compile();

      const testService = module.get<OrdersService>(OrdersService);
      await expect(testService.cancel("order-id", "user-id")).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
