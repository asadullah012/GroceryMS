import { Test, TestingModule } from "@nestjs/testing";
import { AdminUsersController } from "../../src/modules/admin/controllers/admin-users.controller";
import { AdminGroceryController } from "../../src/modules/admin/controllers/admin-grocery.controller";
import { AdminUsersService } from "../../src/modules/admin/services/admin-users.service";
import { AdminGroceryService } from "../../src/modules/admin/services/admin-grocery.service";
import { UserRole } from "../../src/modules/users/entities/user.entity";

describe("AdminUsersController", () => {
  let controller: AdminUsersController;
  let adminUsersService: AdminUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminUsersController],
      providers: [
        {
          provide: AdminUsersService,
          useValue: {
            findAll: jest.fn(),
            updateRole: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AdminUsersController>(AdminUsersController);
    adminUsersService = module.get<AdminUsersService>(AdminUsersService);
  });

  describe("findAll", () => {
    it("should return paginated users", async () => {
      const mockResponse = {
        data: [
          {
            id: "uuid-1",
            name: "User 1",
            email: "user1@test.com",
            role: UserRole.USER,
          },
        ],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };

      adminUsersService.findAll = jest.fn().mockResolvedValue(mockResponse);

      const result = await controller.findAll(1, 10);

      expect(result).toEqual(mockResponse);
    });
  });

  describe("updateRole", () => {
    it("should update user role", async () => {
      const mockUser = { id: "uuid-1", name: "User 1", role: UserRole.ADMIN };

      adminUsersService.updateRole = jest.fn().mockResolvedValue(mockUser);

      const result = await controller.updateRole("uuid-1", { role: "admin" });

      expect(result).toEqual(mockUser);
    });
  });
});

describe("AdminGroceryController", () => {
  let controller: AdminGroceryController;
  let adminGroceryService: AdminGroceryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminGroceryController],
      providers: [
        {
          provide: AdminGroceryService,
          useValue: {
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            updateInventory: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AdminGroceryController>(AdminGroceryController);
    adminGroceryService = module.get<AdminGroceryService>(AdminGroceryService);
  });

  describe("findAll", () => {
    it("should return all grocery items", async () => {
      const mockResponse = {
        data: [
          { id: "uuid-1", name: "Apple", price: 4.99, inventoryCount: 100 },
        ],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };

      adminGroceryService.findAll = jest.fn().mockResolvedValue(mockResponse);

      const result = await controller.findAll(1, 10);

      expect(result).toEqual(mockResponse);
    });
  });

  describe("create", () => {
    it("should create grocery item", async () => {
      const createDto = { name: "Orange", price: 2.99, inventoryCount: 50 };
      const mockItem = { id: "uuid-1", ...createDto };

      adminGroceryService.create = jest.fn().mockResolvedValue(mockItem);

      const result = await controller.create(createDto as any);

      expect(result).toEqual(mockItem);
    });
  });

  describe("update", () => {
    it("should update grocery item", async () => {
      const mockItem = { id: "uuid-1", name: "Apple", price: 5.99 };

      adminGroceryService.update = jest.fn().mockResolvedValue(mockItem);

      const result = await controller.update("uuid-1", { price: 5.99 } as any);

      expect(result).toEqual(mockItem);
    });
  });

  describe("delete", () => {
    it("should delete grocery item", async () => {
      const mockItem = { id: "uuid-1", name: "Apple", isActive: false };

      adminGroceryService.delete = jest.fn().mockResolvedValue(mockItem);

      const result = await controller.delete("uuid-1");

      expect(result).toEqual(mockItem);
    });
  });

  describe("updateInventory", () => {
    it("should update inventory", async () => {
      const mockItem = { id: "uuid-1", name: "Apple", inventoryCount: 50 };

      adminGroceryService.updateInventory = jest
        .fn()
        .mockResolvedValue(mockItem);

      const result = await controller.updateInventory("uuid-1", {
        inventory_count: 50,
      } as any);

      expect(result).toEqual(mockItem);
    });
  });
});
