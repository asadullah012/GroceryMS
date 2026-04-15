import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Order } from "./order.entity";
import { GroceryItem } from "../../grocery/entities/groceryItem.entity";

@Entity("order_items")
export class OrderItem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "order_id" })
  order: Order;

  @Column({ name: "order_id" })
  orderId: string;

  @ManyToOne(() => GroceryItem, (groceryItem) => groceryItem.orderItems)
  @JoinColumn({ name: "grocery_item_id" })
  groceryItem: GroceryItem;

  @Column({ name: "grocery_item_id" })
  groceryItemId: string;

  @Column()
  quantity: number;

  @Column({ name: "unit_price", type: "decimal", precision: 10, scale: 2 })
  unitPrice: number;
}
