import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from "@nestjs/common";
import { ApiTags, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { StoreService } from "../services/store.service";
import {
  CreateProductDto,
  UpdateProductDto,
  CreateOrderDto,
} from "../dto/store.dto";
import { Product } from "../entity/product.entity";
import { Order } from "../entity/order.entity";
import { User } from "../../users/entity/user.entity";
import { ProductCategory } from "../entity/product.entity";
import { OrderStatus } from "../entity/order.entity";

@ApiTags("Store")
@Controller("store")
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  // Product endpoints (public)

  @Get("products")
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 20 })
  @ApiQuery({ name: "category", required: false, enum: ProductCategory })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiQuery({ name: "minPrice", required: false, type: Number })
  @ApiQuery({ name: "maxPrice", required: false, type: Number })
  @ApiQuery({ name: "ecoFriendly", required: false, type: Boolean })
  @ApiResponse({
    status: 200,
    description: "Products retrieved successfully",
  })
  async getProducts(
    @Query("page", new ParseIntPipe({ optional: true })) page: number = 1,
    @Query("limit", new ParseIntPipe({ optional: true })) limit: number = 20,
    @Query("category") category?: ProductCategory,
    @Query("search") search?: string,
    @Query("minPrice", new ParseIntPipe({ optional: true })) minPrice?: number,
    @Query("maxPrice", new ParseIntPipe({ optional: true })) maxPrice?: number,
    @Query("ecoFriendly") ecoFriendly?: boolean
  ) {
    return this.storeService.getProducts(
      page,
      limit,
      category,
      search,
      minPrice,
      maxPrice,
      ecoFriendly
    );
  }

  @Get("products/:id")
  @ApiResponse({
    status: 200,
    description: "Product retrieved successfully",
    type: Product,
  })
  @ApiResponse({ status: 404, description: "Product not found" })
  async getProductById(@Param("id") productId: string): Promise<Product> {
    return this.storeService.getProductById(productId);
  }

  // Order endpoints (authenticated)

  @Post("orders")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: "Order created successfully",
    type: Order,
  })
  @ApiResponse({ status: 400, description: "Invalid order data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async createOrder(
    @Body() createDto: CreateOrderDto,
    @CurrentUser() user: User
  ): Promise<Order> {
    return this.storeService.createOrder(user.id, createDto);
  }

  @Get("orders")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 20 })
  @ApiResponse({
    status: 200,
    description: "User orders retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getUserOrders(
    @CurrentUser() user: User,
    @Query("page", new ParseIntPipe({ optional: true })) page: number = 1,
    @Query("limit", new ParseIntPipe({ optional: true })) limit: number = 20
  ) {
    return this.storeService.getUserOrders(user.id, page, limit);
  }

  @Get("orders/:id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: "Order retrieved successfully",
    type: Order,
  })
  @ApiResponse({ status: 404, description: "Order not found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getOrderById(
    @Param("id") orderId: string,
    @CurrentUser() user: User
  ): Promise<Order> {
    return this.storeService.getOrderById(orderId, user.id);
  }

  @Put("orders/:id/cancel")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: "Order cancelled successfully",
    type: Order,
  })
  @ApiResponse({ status: 400, description: "Order cannot be cancelled" })
  @ApiResponse({ status: 404, description: "Order not found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async cancelOrder(
    @Param("id") orderId: string,
    @CurrentUser() user: User,
    @Body() body: { reason?: string }
  ): Promise<Order> {
    return this.storeService.cancelOrder(orderId, user.id, body.reason);
  }
}

@ApiTags("Admin Store")
@Controller("admin/store")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminStoreController {
  constructor(private readonly storeService: StoreService) {}

  // Admin product management

  @Post("products")
  @ApiResponse({
    status: 201,
    description: "Product created successfully",
    type: Product,
  })
  @ApiResponse({ status: 400, description: "Invalid product data" })
  async createProduct(@Body() createDto: CreateProductDto): Promise<Product> {
    return this.storeService.createProduct(createDto);
  }

  @Put("products/:id")
  @ApiResponse({
    status: 200,
    description: "Product updated successfully",
    type: Product,
  })
  @ApiResponse({ status: 404, description: "Product not found" })
  async updateProduct(
    @Param("id") productId: string,
    @Body() updateDto: UpdateProductDto
  ): Promise<Product> {
    return this.storeService.updateProduct(productId, updateDto);
  }

  @Delete("products/:id")
  @ApiResponse({
    status: 200,
    description: "Product deleted successfully",
  })
  @ApiResponse({ status: 404, description: "Product not found" })
  async deleteProduct(
    @Param("id") productId: string
  ): Promise<{ message: string }> {
    await this.storeService.deleteProduct(productId);
    return { message: "Product deleted successfully" };
  }

  // Admin order management

  @Get("orders")
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 20 })
  @ApiQuery({ name: "status", required: false, enum: OrderStatus })
  @ApiResponse({
    status: 200,
    description: "All orders retrieved successfully",
  })
  async getAllOrders(
    @Query("page", new ParseIntPipe({ optional: true })) page: number = 1,
    @Query("limit", new ParseIntPipe({ optional: true })) limit: number = 20,
    @Query("status") status?: OrderStatus
  ) {
    return this.storeService.getAllOrders(page, limit, status);
  }

  @Get("orders/:id")
  @ApiResponse({
    status: 200,
    description: "Order retrieved successfully",
    type: Order,
  })
  @ApiResponse({ status: 404, description: "Order not found" })
  async getOrderById(@Param("id") orderId: string): Promise<Order> {
    return this.storeService.getOrderById(orderId);
  }

  @Put("orders/:id/status")
  @ApiResponse({
    status: 200,
    description: "Order status updated successfully",
    type: Order,
  })
  @ApiResponse({ status: 404, description: "Order not found" })
  async updateOrderStatus(
    @Param("id") orderId: string,
    @Body() body: { status: OrderStatus; notes?: string }
  ): Promise<Order> {
    return this.storeService.updateOrderStatus(
      orderId,
      body.status,
      body.notes
    );
  }
}
