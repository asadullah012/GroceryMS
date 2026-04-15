import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "../users/entities/user.entity";
import { JwtService } from "@nestjs/jwt";
import { ConflictException, UnauthorizedException } from "@nestjs/common";

jest.mock("bcrypt", () => ({
  __esModule: true,
  hash: jest.fn().mockResolvedValue("hashedpassword"),
  compare: jest.fn().mockResolvedValue(true),
}));

describe("AuthService", () => {
  let service: AuthService;
  let mockRepository: any;
  let mockJwtService: any;

  beforeEach(async () => {
    mockRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockRepository },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe("register", () => {
    it("should throw ConflictException if email already exists", async () => {
      mockRepository.findOne.mockResolvedValue({ email: "test@example.com" });

      await expect(
        service.register({
          email: "test@example.com",
          password: "password",
          name: "Test",
        }),
      ).rejects.toThrow(ConflictException);
    });

    it("should create new user successfully", async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue({
        id: "1",
        email: "test@example.com",
      });
      mockRepository.save.mockResolvedValue({
        id: "1",
        email: "test@example.com",
      });

      const result = await service.register({
        email: "new@example.com",
        password: "password",
        name: "New User",
      });

      expect(result.email).toBe("test@example.com");
    });
  });

  describe("login", () => {
    it("should throw UnauthorizedException if user not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.login({ email: "test@example.com", password: "password" }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException if password is invalid", async () => {
      const { compare } = require("bcrypt");
      (compare as jest.Mock).mockResolvedValueOnce(false);
      mockRepository.findOne.mockResolvedValue({ password: "hashed" });

      await expect(
        service.login({ email: "test@example.com", password: "wrong" }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should return token on successful login", async () => {
      mockRepository.findOne.mockResolvedValue({
        id: "1",
        email: "test@example.com",
        password: "hashed",
        role: "user",
      });
      mockJwtService.sign.mockReturnValue("token");

      const result = await service.login({
        email: "test@example.com",
        password: "password",
      });

      expect(result.access_token).toBe("token");
    });
  });
});
