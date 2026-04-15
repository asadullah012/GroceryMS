import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { AdminUsersService } from "./admin-users.service";
import { AdminGroceryService } from "./admin-grocery.service";
import { User, UserRole } from "../../users/entities/user.entity";
import { GroceryItem } from "../../grocery/entities/groceryItem.entity";
import { NotFoundException, ConflictException } from "@nestjs/common";

describe("AdminUsersService", () => {
  describe("findAll", () => {
    it("should return paginated users", async () => {
      const mockUsers: any = [
        {
          id: "1",
          name: "User 1",
          email: "user1@test.com",
          role: UserRole.USER,
          passwordHash: "hash",
        },
        {
          id: "2",
          name: "User 2",
          email: "user2@test.com",
          role: UserRole.ADMIN,
          passwordHash: "hash",
        },
      ];

      const mockRepository: any = {
        findAndCount: jest.fn().mockResolvedValue([mockUsers, 2]),
      };

      const module = await Test.createTestingModule({
        providers: [
          AdminUsersService,
          { provide: getRepositoryToken(User), useValue: mockRepository },
        ],
      }).compile();

      const service = module.get<AdminUsersService>(AdminUsersService);
      const result = await service.findAll(1, 10);

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
    });
  });

  describe("updateRole", () => {
    it("should update user role successfully", async () => {
      const mockUser: any = {
        id: "1",
        name: "User 1",
        email: "user@test.com",
        role: UserRole.USER,
      };

      const mockRepository: any = {
        findOne: jest.fn().mockResolvedValue(mockUser),
        count: jest.fn().mockResolvedValue(2),
        save: jest
          .fn()
          .mockResolvedValue({ ...mockUser, role: UserRole.ADMIN }),
      };

      const module = await Test.createTestingModule({
        providers: [
          AdminUsersService,
          { provide: getRepositoryToken(User), useValue: mockRepository },
        ],
      }).compile();

      const service = module.get<AdminUsersService>(AdminUsersService);
      const result = await service.updateRole("1", UserRole.ADMIN);

      expect(result.role).toBe(UserRole.ADMIN);
    });

    it("should throw NotFoundException when user not found", async () => {
      const mockRepository: any = {
        findOne: jest.fn().mockResolvedValue(null),
      };

      const module = await Test.createTestingModule({
        providers: [
          AdminUsersService,
          { provide: getRepositoryToken(User), useValue: mockRepository },
        ],
      }).compile();

      const service = module.get<AdminUsersService>(AdminUsersService);
      await expect(
        service.updateRole("non-existent", UserRole.ADMIN),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw ConflictException when demoting last admin", async () => {
      const mockAdmin: any = {
        id: "1",
        name: "Admin",
        email: "admin@test.com",
        role: UserRole.ADMIN,
      };

      const mockRepository: any = {
        findOne: jest.fn().mockResolvedValue(mockAdmin),
        count: jest.fn().mockResolvedValue(1),
        save: jest.fn(),
      };

      const module = await Test.createTestingModule({
        providers: [
          AdminUsersService,
          { provide: getRepositoryToken(User), useValue: mockRepository },
        ],
      }).compile();

      const service = module.get<AdminUsersService>(AdminUsersService);
      await expect(service.updateRole("1", UserRole.USER)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});

describe("AdminGroceryService", () => {
  describe("findAll", () => {
    it("should return all grocery items", async () => {
      const mockItems: any = [
        {
          id: "1",
          name: "Apple",
          price: 4.99,
          inventoryCount: 100,
          isActive: true,
        },
        {
          id: "2",
          name: "Milk",
          price: 6.49,
          inventoryCount: 50,
          isActive: true,
        },
      ];

      const mockRepository: any = {
        findAndCount: jest.fn().mockResolvedValue([mockItems, 2]),
      };

      const module = await Test.createTestingModule({
        providers: [
          AdminGroceryService,
          {
            provide: getRepositoryToken(GroceryItem),
            useValue: mockRepository,
          },
        ],
      }).compile();

      const service = module.get<AdminGroceryService>(AdminGroceryService);
      const result = await service.findAll(1, 10);

      expect(result.data).toHaveLength(2);
    });
  });

  describe("create", () => {
    it("should create grocery item successfully", async () => {
      const createDto = {
        name: "Orange",
        description: "Fresh orange",
        price: 2.99,
        inventoryCount: 50,
      };

      const mockRepository: any = {
        create: jest.fn().mockReturnValue(createDto),
        save: jest.fn().mockResolvedValue({ id: "1", ...createDto }),
      };

      const module = await Test.createTestingModule({
        providers: [
          AdminGroceryService,
          {
            provide: getRepositoryToken(GroceryItem),
            useValue: mockRepository,
          },
        ],
      }).compile();

      const service = module.get<AdminGroceryService>(AdminGroceryService);
      const result = await service.create(createDto);

      expect(result.name).toBe("Orange");
    });
  });

  describe("update", () => {
    it("should update grocery item successfully", async () => {
      const mockItem: any = {
        id: "1",
        name: "Apple",
        price: 4.99,
        inventoryCount: 100,
        isActive: true,
      };

      const mockRepository: any = {
        findOne: jest.fn().mockResolvedValue(mockItem),
        save: jest.fn().mockResolvedValue({ ...mockItem, price: 5.99 }),
      };

      const module = await Test.createTestingModule({
        providers: [
          AdminGroceryService,
          {
            provide: getRepositoryToken(GroceryItem),
            useValue: mockRepository,
          },
        ],
      }).compile();

      const service = module.get<AdminGroceryService>(AdminGroceryService);
      const result = await service.update("1", { price: 5.99 });

      expect(result.price).toBe(5.99);
    });

    it("should throw NotFoundException when item not found", async () => {
      const mockRepository: any = {
        findOne: jest.fn().mockResolvedValue(null),
      };

      const module = await Test.createTestingModule({
        providers: [
          AdminGroceryService,
          {
            provide: getRepositoryToken(GroceryItem),
            useValue: mockRepository,
          },
        ],
      }).compile();

      const service = module.get<AdminGroceryService>(AdminGroceryService);
      await expect(
        service.update("non-existent", { price: 5.99 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("delete", () => {
    it("should soft delete grocery item", async () => {
      const mockItem: any = { id: "1", name: "Apple", isActive: true };

      const mockRepository: any = {
        findOne: jest.fn().mockResolvedValue(mockItem),
        save: jest.fn().mockResolvedValue({ ...mockItem, isActive: false }),
      };

      const module = await Test.createTestingModule({
        providers: [
          AdminGroceryService,
          {
            provide: getRepositoryToken(GroceryItem),
            useValue: mockRepository,
          },
        ],
      }).compile();

      const service = module.get<AdminGroceryService>(AdminGroceryService);
      const result = await service.delete("1");

      expect(result.isActive).toBe(false);
    });

    it("should throw NotFoundException when item not found", async () => {
      const mockRepository: any = {
        findOne: jest.fn().mockResolvedValue(null),
      };

      const module = await Test.createTestingModule({
        providers: [
          AdminGroceryService,
          {
            provide: getRepositoryToken(GroceryItem),
            useValue: mockRepository,
          },
        ],
      }).compile();

      const service = module.get<AdminGroceryService>(AdminGroceryService);
      await expect(service.delete("non-existent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("updateInventory", () => {
    it("should update inventory successfully", async () => {
      const mockItem: any = {
        id: "1",
        name: "Apple",
        inventoryCount: 100,
        isActive: true,
      };

      const mockRepository: any = {
        findOne: jest.fn().mockResolvedValue(mockItem),
        save: jest.fn().mockResolvedValue({ ...mockItem, inventoryCount: 50 }),
      };

      const module = await Test.createTestingModule({
        providers: [
          AdminGroceryService,
          {
            provide: getRepositoryToken(GroceryItem),
            useValue: mockRepository,
          },
        ],
      }).compile();

      const service = module.get<AdminGroceryService>(AdminGroceryService);
      const result = await service.updateInventory("1", 50);

      expect(result.inventoryCount).toBe(50);
    });

    it("should throw error when inventory is negative", async () => {
      const mockRepository: any = { findOne: jest.fn() };

      const module = await Test.createTestingModule({
        providers: [
          AdminGroceryService,
          {
            provide: getRepositoryToken(GroceryItem),
            useValue: mockRepository,
          },
        ],
      }).compile();

      const service = module.get<AdminGroceryService>(AdminGroceryService);
      await expect(service.updateInventory("1", -10)).rejects.toThrow(
        "Inventory count cannot be negative",
      );
    });

    it("should throw NotFoundException when item not found", async () => {
      const mockRepository: any = {
        findOne: jest.fn().mockResolvedValue(null),
      };

      const module = await Test.createTestingModule({
        providers: [
          AdminGroceryService,
          {
            provide: getRepositoryToken(GroceryItem),
            useValue: mockRepository,
          },
        ],
      }).compile();

      const service = module.get<AdminGroceryService>(AdminGroceryService);
      await expect(service.updateInventory("non-existent", 50)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
