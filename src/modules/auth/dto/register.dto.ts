import { IsEmail, IsString, MinLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class RegisterDto {
  @ApiProperty({
    example: "John Doe",
    description: "User's full name",
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({
    example: "john@example.com",
    description: "User's email address (must be unique)",
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: "password123",
    description: "Password (minimum 8 characters)",
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;
}
