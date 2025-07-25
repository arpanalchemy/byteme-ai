import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from "@nestjs/common";
import { ApiTags, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { AdminService } from "../services/admin.service";
import { AdminLoginDto } from "../dto/admin-login.dto";
import {
  AdminDashboardStatsDto,
  AdminUserStatsDto,
} from "../dto/admin-dashboard.dto";
import { Public } from "../../../common/decorators/public.decorator";

@ApiTags("Admin")
@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post("login")
  @Public()
  @ApiResponse({
    status: 200,
    description: "Admin login successful",
    schema: {
      type: "object",
      properties: {
        token: {
          type: "string",
          example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        },
        message: {
          type: "string",
          example: "Admin login successful",
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: "Invalid admin credentials" })
  async adminLogin(@Body() loginDto: AdminLoginDto) {
    return this.adminService.adminLogin(loginDto);
  }

  @Get("dashboard/stats")
  @ApiResponse({
    status: 200,
    description: "Dashboard statistics retrieved successfully",
    type: AdminDashboardStatsDto,
  })
  async getDashboardStats(): Promise<AdminDashboardStatsDto> {
    return this.adminService.getDashboardStats();
  }

  @Get("users")
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 20 })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiResponse({
    status: 200,
    description: "Users retrieved successfully",
    schema: {
      type: "object",
      properties: {
        users: {
          type: "array",
          items: { $ref: "#/components/schemas/AdminUserStatsDto" },
        },
        total: { type: "number", example: 1250 },
        page: { type: "number", example: 1 },
        limit: { type: "number", example: 20 },
      },
    },
  })
  async getAllUsers(
    @Query("page", new ParseIntPipe({ optional: true })) page: number = 1,
    @Query("limit", new ParseIntPipe({ optional: true })) limit: number = 20,
    @Query("search") search?: string
  ) {
    return this.adminService.getAllUsers(page, limit, search);
  }

  @Get("users/:id")
  @ApiResponse({
    status: 200,
    description: "User details retrieved successfully",
    type: AdminUserStatsDto,
  })
  @ApiResponse({ status: 404, description: "User not found" })
  async getUserDetails(
    @Param("id") userId: string
  ): Promise<AdminUserStatsDto> {
    return this.adminService.getUserDetails(userId);
  }

  @Put("users/:id/toggle-status")
  @ApiResponse({
    status: 200,
    description: "User status toggled successfully",
    schema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          example: "User blocked successfully",
        },
        isActive: {
          type: "boolean",
          example: false,
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: "User not found" })
  async toggleUserStatus(@Param("id") userId: string) {
    return this.adminService.toggleUserStatus(userId);
  }

  @Get("users/:id/vehicles")
  @ApiResponse({
    status: 200,
    description: "User vehicles retrieved successfully",
  })
  @ApiResponse({ status: 404, description: "User not found" })
  async getUserVehicles(@Param("id") userId: string) {
    return this.adminService.getUserVehicles(userId);
  }

  @Get("users/:id/uploads")
  @ApiResponse({
    status: 200,
    description: "User upload history retrieved successfully",
  })
  @ApiResponse({ status: 404, description: "User not found" })
  async getUserUploadHistory(@Param("id") userId: string) {
    return this.adminService.getUserUploadHistory(userId);
  }

  @Get("analytics/system")
  @ApiResponse({
    status: 200,
    description: "System analytics retrieved successfully",
  })
  async getSystemAnalytics() {
    return this.adminService.getSystemAnalytics();
  }
}
