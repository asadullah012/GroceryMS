import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like } from "typeorm";
import { GroceryItem } from "../entities/groceryItem.entity";

@Injectable()
export class GroceryService {
  private static readonly MAX_LIMIT = 100;

  constructor(
    @InjectRepository(GroceryItem)
    private groceryRepository: Repository<GroceryItem>,
  ) {}

  async findAll(page = 1, limit = 10, search?: string) {
    const cappedLimit = Math.min(limit, GroceryService.MAX_LIMIT);
    const queryBuilder = this.groceryRepository
      .createQueryBuilder("item")
      .where("item.isActive = :isActive", { isActive: true })
      .andWhere("item.inventoryCount > :inventoryCount", { inventoryCount: 0 });

    if (search) {
      queryBuilder.andWhere("item.name ILIKE :search", {
        search: `%${search}%`,
      });
    }

    queryBuilder
      .orderBy("item.name", "ASC")
      .skip((page - 1) * cappedLimit)
      .take(cappedLimit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      data: items.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        inventoryCount: item.inventoryCount,
      })),
      meta: {
        page,
        limit: cappedLimit,
        total,
        totalPages: Math.ceil(total / cappedLimit),
      },
    };
  }
}
