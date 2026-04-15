import {
  IsInt,
  IsUUID,
  IsArray,
  ArrayMinSize,
  ValidateNested,
  IsOptional,
  Min,
  Max,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateOrderItemDto {
  @ApiProperty({
    example: "550e8400-e29b-41d4-a716-446655440000",
    description: "Grocery item ID (UUID)",
  })
  @IsUUID()
  grocery_item_id: string;

  @ApiPropertyOptional({
    example: 2,
    description: "Quantity (default: 1)",
    default: 1,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(999)
  quantity?: number;
}

export class CreateOrderDto {
  @ApiProperty({
    type: [CreateOrderItemDto],
    description: "Array of items to order",
    example: [
      { grocery_item_id: "550e8400-e29b-41d4-a716-446655440000", quantity: 2 },
      { grocery_item_id: "660e8400-e29b-41d4-a716-446655440001", quantity: 1 },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
