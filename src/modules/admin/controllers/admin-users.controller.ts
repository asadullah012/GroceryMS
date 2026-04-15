import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
  ApiParam,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { UserRole } from "../../users/entities/user.entity";
import { AdminUsersService } from "../services/admin-users.service";
import { UpdateRoleDto } from "../dto/admin-grocery.dto";

@ApiTags("Admin - Users")
@ApiBearerAuth()
@Controller("admin/users")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  @ApiOperation({ summary: "List all users" })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Page number (default: 1)",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Items per page (default: 10)",
  })
  @ApiResponse({ status: 200, description: "Returns paginated list of users" })
  findAll(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ) {
    return this.adminUsersService.findAll(page, limit);
  }

  @Patch(":id/role")
  @ApiOperation({ summary: "Update user role" })
  @ApiParam({ name: "id", description: "User ID (UUID)" })
  @ApiResponse({ status: 200, description: "User role updated successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  updateRole(
    @Param("id") userId: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.adminUsersService.updateRole(
      userId,
      updateRoleDto.role as UserRole,
    );
  }
}
