import { Test, TestingModule } from "@nestjs/testing";
import { GroceryService } from "../../src/modules/grocery/services/grocery.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { GroceryItem } from "../../src/modules/grocery/entities/groceryItem.entity";

describe("GroceryService", () => {
  let service: GroceryService;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroceryService,
        { provide: getRepositoryToken(GroceryItem), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<GroceryService>(GroceryService);
  });

  describe("findAll", () => {
    it("should return paginated items", async () => {
      const mockItems = [
        { id: "1", name: "Apple", description: "Fresh apples", price: 1.99 },
      ];

      mockRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockItems, 1]),
      });

      const result = await service.findAll(1, 10);

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it("should filter by search term", async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await service.findAll(1, 10, "apple");

      expect(queryBuilder.andWhere).toHaveBeenCalled();
    });
  });
});
