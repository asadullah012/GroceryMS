import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { Order, OrderStatus } from "./entities/order.entity";
import { OrderItem } from "./entities/orderItem.entity";
import { GroceryItem } from "../grocery/entities/groceryItem.entity";
import { CreateOrderDto } from "./dto/create-order.dto";

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(GroceryItem)
    private groceryRepository: Repository<GroceryItem>,
    private dataSource: DataSource,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction("SERIALIZABLE");

    try {
      const orderItemsData: {
        groceryItem: GroceryItem;
        quantity: number;
        unitPrice: number;
      }[] = [];
      let totalPrice = 0;

      for (const itemDto of createOrderDto.items) {
        const groceryItem = await queryRunner.manager.findOne(GroceryItem, {
          where: { id: itemDto.grocery_item_id },
          lock: { mode: "pessimistic_write" },
        });

        if (!groceryItem) {
          throw new NotFoundException(
            `Grocery item not found: ${itemDto.grocery_item_id}`,
          );
        }

        if (groceryItem.inventoryCount < (itemDto.quantity ?? 1)) {
          throw new BadRequestException(
            `Insufficient inventory for item: ${groceryItem.name} (available: ${groceryItem.inventoryCount})`,
          );
        }

        const quantity = itemDto.quantity ?? 1;
        groceryItem.inventoryCount -= quantity;
        await queryRunner.manager.save(groceryItem);

        orderItemsData.push({
          groceryItem,
          quantity,
          unitPrice: Number(groceryItem.price),
        });
        totalPrice += Number(groceryItem.price) * quantity;
      }

      const order = queryRunner.manager.create(Order, {
        userId,
        status: OrderStatus.CONFIRMED,
        totalPrice,
      });
      const savedOrder = await queryRunner.manager.save(Order, order);

      const orderItems = orderItemsData.map((item) =>
        queryRunner.manager.create(OrderItem, {
          orderId: savedOrder.id,
          groceryItemId: item.groceryItem.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        }),
      );
      await queryRunner.manager.save(OrderItem, orderItems);

      await queryRunner.commitTransaction();

      return this.findOne(savedOrder.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findOne(orderId: string) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ["items", "items.groceryItem"],
    });
    if (!order) throw new NotFoundException("Order not found");

    return {
      id: order.id,
      status: order.status,
      totalPrice: order.totalPrice,
      userId: order.userId,
      createdAt: order.createdAt,
      items: order.items.map((item: OrderItem) => ({
        id: item.id,
        groceryItemId: item.groceryItemId,
        groceryItemName: item.groceryItem?.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    };
  }

  async findByUser(userId: string, page = 1, limit = 10, status?: OrderStatus) {
    const queryBuilder = this.ordersRepository
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.items", "items")
      .leftJoinAndSelect("items.groceryItem", "groceryItem")
      .where("order.userId = :userId", { userId });

    if (status) {
      queryBuilder.andWhere("order.status = :status", { status });
    }

    queryBuilder
      .orderBy("order.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    const [orders, total] = await queryBuilder.getManyAndCount();

    return {
      data: orders.map((order: Order) => ({
        id: order.id,
        status: order.status,
        totalPrice: order.totalPrice,
        createdAt: order.createdAt,
        items: order.items.map((item: OrderItem) => ({
          groceryItemName: item.groceryItem?.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async cancel(orderId: string, userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction("SERIALIZABLE");

    try {
      const order = await queryRunner.manager.findOne(Order, {
        where: { id: orderId },
        relations: ["items"],
      });
      if (!order) throw new NotFoundException("Order not found");
      if (order.userId !== userId)
        throw new ForbiddenException("Not your order");
      if (order.status === OrderStatus.CANCELLED) {
        throw new BadRequestException("Order already cancelled");
      }

      order.status = OrderStatus.CANCELLED;
      await queryRunner.manager.save(Order, order);

      for (const item of order.items) {
        const groceryItem = await queryRunner.manager.findOne(GroceryItem, {
          where: { id: item.groceryItemId },
          lock: { mode: "pessimistic_write" },
        });
        if (groceryItem) {
          groceryItem.inventoryCount += item.quantity;
          await queryRunner.manager.save(GroceryItem, groceryItem);
        }
      }

      await queryRunner.commitTransaction();
      return { message: "Order cancelled successfully" };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
