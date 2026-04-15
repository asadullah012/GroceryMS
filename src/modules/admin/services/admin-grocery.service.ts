import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { GroceryItem } from "../../grocery/entities/groceryItem.entity";

@Injectable()
export class AdminGroceryService {
  private static readonly MAX_LIMIT = 100;

  constructor(
    @InjectRepository(GroceryItem)
    private groceryRepository: Repository<GroceryItem>,
  ) {}

  async findAll(page = 1, limit = 10) {
    const cappedLimit = Math.min(limit, AdminGroceryService.MAX_LIMIT);
    const [items, total] = await this.groceryRepository.findAndCount({
      skip: (page - 1) * cappedLimit,
      take: cappedLimit,
      order: { createdAt: "DESC" },
      where: { isActive: true },
    });

    return {
      data: items,
      meta: {
        page,
        limit: cappedLimit,
        total,
        totalPages: Math.ceil(total / cappedLimit),
      },
    };
  }

  async create(data: {
    name: string;
    description?: string;
    price: number;
    inventoryCount: number;
  }) {
    const item = this.groceryRepository.create(data);
    return this.groceryRepository.save(item);
  }

  async update(
    id: string,
    data: { name?: string; description?: string; price?: number },
  ) {
    const item = await this.groceryRepository.findOne({ where: { id } });
    if (!item) throw new NotFoundException("Grocery item not found");

    Object.assign(item, data);
    return this.groceryRepository.save(item);
  }

  async delete(id: string) {
    const item = await this.groceryRepository.findOne({ where: { id } });
    if (!item) throw new NotFoundException("Grocery item not found");

    item.isActive = false;
    return this.groceryRepository.save(item);
  }

  async updateInventory(id: string, inventoryCount: number) {
    if (inventoryCount < 0) {
      throw new BadRequestException("Inventory count cannot be negative");
    }

    const item = await this.groceryRepository.findOne({ where: { id } });
    if (!item) throw new NotFoundException("Grocery item not found");

    item.inventoryCount = inventoryCount;
    return this.groceryRepository.save(item);
  }
}
