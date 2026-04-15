import { Test, TestingModule } from "@nestjs/testing";
import { GroceryController } from "./grocery.controller";
import { GroceryService } from "./grocery.service";

describe("GroceryController", () => {
  let controller: GroceryController;
  let groceryService: GroceryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroceryController],
      providers: [
        {
          provide: GroceryService,
          useValue: {
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<GroceryController>(GroceryController);
    groceryService = module.get<GroceryService>(GroceryService);
  });

  describe("findAll", () => {
    it("should return paginated grocery items", async () => {
      const mockResponse = {
        data: [
          {
            id: "uuid-1",
            name: "Apple",
            description: "Fresh apples",
            price: 4.99,
          },
          {
            id: "uuid-2",
            name: "Milk",
            description: "Organic milk",
            price: 6.49,
          },
        ],
        meta: { page: 1, limit: 10, total: 2, totalPages: 1 },
      };

      groceryService.findAll = jest.fn().mockResolvedValue(mockResponse);

      const result = await controller.findAll(1, 10);

      expect(result).toEqual(mockResponse);
      expect(groceryService.findAll).toHaveBeenCalledWith(1, 10, undefined);
    });

    it("should filter by search term", async () => {
      const mockResponse = {
        data: [
          {
            id: "uuid-1",
            name: "Apple",
            description: "Fresh apples",
            price: 4.99,
          },
        ],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };

      groceryService.findAll = jest.fn().mockResolvedValue(mockResponse);

      const result = await controller.findAll(1, 10, "apple");

      expect(groceryService.findAll).toHaveBeenCalledWith(1, 10, "apple");
    });
  });
});
