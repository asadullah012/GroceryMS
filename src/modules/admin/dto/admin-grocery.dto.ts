import { IsString, IsNumber, IsOptional, Min, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateGroceryItemDto {
  @ApiProperty({ example: "Organic Apples" })
  @IsString()
  name: string;

  @ApiProperty({ example: "Fresh organic apples", required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 4.99 })
  @IsNumber()
  @Min(0.01)
  price: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  inventoryCount: number;
}

export class UpdateGroceryItemDto {
  @ApiProperty({ example: "Organic Apples", required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: "Fresh organic apples", required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 5.99, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0.01)
  price?: number;
}

export class UpdateInventoryDto {
  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(0)
  inventoryCount: number;
}

export class UpdateRoleDto {
  @ApiProperty({ enum: ["admin", "user"], example: "admin" })
  @IsEnum(["admin", "user"])
  role: "admin" | "user";
}
