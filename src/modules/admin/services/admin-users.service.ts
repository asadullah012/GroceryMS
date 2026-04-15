import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User, UserRole } from "../../users/entities/user.entity";

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(page = 1, limit = 10) {
    const [users, total] = await this.usersRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: "DESC" },
    });

    return {
      data: users.map(({ passwordHash, ...user }) => user),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateRole(userId: string, role: UserRole) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const adminCount = await this.usersRepository.count({
      where: { role: UserRole.ADMIN },
    });
    if (
      user.role === UserRole.ADMIN &&
      role === UserRole.USER &&
      adminCount <= 1
    ) {
      throw new ConflictException("Cannot demote the last admin");
    }

    user.role = role;
    await this.usersRepository.save(user);

    const { passwordHash, ...result } = user;
    return result;
  }
}
