import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "../../src/modules/auth/controllers/auth.controller";
import { AuthService } from "../../src/modules/auth/services/auth.service";
import { LoginDto } from "../../src/modules/auth/dto/login.dto";
import { RegisterDto } from "../../src/modules/auth/dto/register.dto";

describe("AuthController", () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe("register", () => {
    it("should register a new user", async () => {
      const registerDto: RegisterDto = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      };

      const mockUser = {
        id: "uuid-1",
        name: "Test User",
        email: "test@example.com",
        role: "user",
      };

      authService.register = jest.fn().mockResolvedValue(mockUser);

      const result = await controller.register(registerDto);

      expect(result).toEqual(mockUser);
    });
  });

  describe("login", () => {
    it("should login user and return token", async () => {
      const loginDto: LoginDto = {
        email: "test@example.com",
        password: "password123",
      };

      const mockResponse = {
        access_token: "jwt-token",
        user: {
          id: "uuid-1",
          name: "Test User",
          email: "test@example.com",
          role: "user",
        },
      };

      authService.login = jest.fn().mockResolvedValue(mockResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(mockResponse);
    });
  });
});
