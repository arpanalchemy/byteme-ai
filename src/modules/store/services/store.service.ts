import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  Product,
  ProductCategory,
  ProductStatus,
} from "../entity/product.entity";
import { Order, OrderStatus, PaymentStatus } from "../entity/order.entity";
import { User } from "../../users/entity/user.entity";
import {
  CreateProductDto,
  UpdateProductDto,
  CreateOrderDto,
} from "../dto/store.dto";

@Injectable()
export class StoreService {
  private readonly logger = new Logger(StoreService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  // Product Management

  /**
   * Create a new product
   */
  async createProduct(createDto: CreateProductDto): Promise<Product> {
    try {
      const product = this.productRepository.create(createDto);
      const savedProduct = await this.productRepository.save(product);

      this.logger.log(`Product created: ${savedProduct.id}`);
      return savedProduct;
    } catch (error) {
      this.logger.error(`Failed to create product: ${error.message}`);
      throw new BadRequestException("Failed to create product");
    }
  }

  /**
   * Get all products with filtering and pagination
   */
  async getProducts(
    page: number = 1,
    limit: number = 20,
    category?: ProductCategory,
    search?: string,
    minPrice?: number,
    maxPrice?: number,
    ecoFriendly?: boolean
  ): Promise<{
    products: Product[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const offset = (page - 1) * limit;

      const query = this.productRepository
        .createQueryBuilder("product")
        .where("product.status = :status", { status: ProductStatus.ACTIVE });

      if (category) {
        query.andWhere("product.category = :category", { category });
      }

      if (search) {
        query.andWhere(
          "(product.name ILIKE :search OR product.description ILIKE :search OR product.tags::text ILIKE :search)",
          { search: `%${search}%` }
        );
      }

      if (minPrice !== undefined) {
        query.andWhere("product.price >= :minPrice", { minPrice });
      }

      if (maxPrice !== undefined) {
        query.andWhere("product.price <= :maxPrice", { maxPrice });
      }

      if (ecoFriendly !== undefined) {
        query.andWhere("product.isEcoFriendly = :ecoFriendly", { ecoFriendly });
      }

      const total = await query.getCount();
      const products = await query
        .skip(offset)
        .take(limit)
        .orderBy("product.createdAt", "DESC")
        .getMany();

      return {
        products,
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error(`Failed to get products: ${error.message}`);
      throw new BadRequestException("Failed to get products");
    }
  }

  /**
   * Get product by ID
   */
  async getProductById(productId: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    // Increment view count
    product.viewCount += 1;
    await this.productRepository.save(product);

    return product;
  }

  /**
   * Update product
   */
  async updateProduct(
    productId: string,
    updateDto: UpdateProductDto
  ): Promise<Product> {
    try {
      const product = await this.productRepository.findOne({
        where: { id: productId },
      });

      if (!product) {
        throw new NotFoundException("Product not found");
      }

      Object.assign(product, updateDto);
      const updatedProduct = await this.productRepository.save(product);

      this.logger.log(`Product updated: ${productId}`);
      return updatedProduct;
    } catch (error) {
      this.logger.error(`Failed to update product: ${error.message}`);
      throw new BadRequestException("Failed to update product");
    }
  }

  /**
   * Delete product (soft delete by setting status to inactive)
   */
  async deleteProduct(productId: string): Promise<void> {
    try {
      const product = await this.productRepository.findOne({
        where: { id: productId },
      });

      if (!product) {
        throw new NotFoundException("Product not found");
      }

      product.status = ProductStatus.INACTIVE;
      await this.productRepository.save(product);

      this.logger.log(`Product deleted: ${productId}`);
    } catch (error) {
      this.logger.error(`Failed to delete product: ${error.message}`);
      throw new BadRequestException("Failed to delete product");
    }
  }

  // Order Management

  /**
   * Create a new order
   */
  async createOrder(userId: string, createDto: CreateOrderDto): Promise<Order> {
    try {
      const { productId, quantity, shippingAddress, customerNotes } = createDto;

      // Get product
      const product = await this.productRepository.findOne({
        where: { id: productId },
      });

      if (!product) {
        throw new NotFoundException("Product not found");
      }

      if (!product.isInStock) {
        throw new ConflictException("Product is out of stock");
      }

      if (quantity > product.stockQuantity) {
        throw new BadRequestException("Insufficient stock");
      }

      // Get user
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException("User not found");
      }

      // Calculate prices
      const unitPrice = product.displayPrice;
      const totalPrice = unitPrice * quantity;

      // Check if user has enough B3TR balance
      if (user.b3trBalance < totalPrice) {
        throw new BadRequestException("Insufficient B3TR balance");
      }

      // Create order
      const order = this.orderRepository.create({
        userId,
        productId,
        quantity,
        unitPrice,
        totalPrice,
        shippingAddress,
        customerNotes,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
      });

      const savedOrder = await this.orderRepository.save(order);

      // Deduct B3TR from user balance
      user.b3trBalance -= totalPrice;
      await this.userRepository.save(user);

      // Update product stock
      product.stockQuantity -= quantity;
      product.soldCount += quantity;
      await this.productRepository.save(product);

      this.logger.log(`Order created: ${savedOrder.id}`);
      return savedOrder;
    } catch (error) {
      this.logger.error(`Failed to create order: ${error.message}`);
      throw new BadRequestException("Failed to create order");
    }
  }

  /**
   * Get user orders
   */
  async getUserOrders(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    orders: Order[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const offset = (page - 1) * limit;

      const query = this.orderRepository
        .createQueryBuilder("order")
        .leftJoinAndSelect("order.product", "product")
        .where("order.userId = :userId", { userId });

      const total = await query.getCount();
      const orders = await query
        .skip(offset)
        .take(limit)
        .orderBy("order.createdAt", "DESC")
        .getMany();

      return {
        orders,
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error(`Failed to get user orders: ${error.message}`);
      throw new BadRequestException("Failed to get user orders");
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId: string, userId?: string): Promise<Order> {
    const query = this.orderRepository
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.product", "product")
      .leftJoinAndSelect("order.user", "user")
      .where("order.id = :orderId", { orderId });

    if (userId) {
      query.andWhere("order.userId = :userId", { userId });
    }

    const order = await query.getOne();

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    return order;
  }

  /**
   * Update order status (admin only)
   */
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    notes?: string
  ): Promise<Order> {
    try {
      const order = await this.orderRepository.findOne({
        where: { id: orderId },
      });

      if (!order) {
        throw new NotFoundException("Order not found");
      }

      order.status = status;
      if (notes) {
        order.notes = notes;
      }

      // Update payment status if order is confirmed
      if (status === OrderStatus.CONFIRMED) {
        order.paymentStatus = PaymentStatus.PAID;
      }

      const updatedOrder = await this.orderRepository.save(order);

      this.logger.log(`Order status updated: ${orderId} -> ${status}`);
      return updatedOrder;
    } catch (error) {
      this.logger.error(`Failed to update order status: ${error.message}`);
      throw new BadRequestException("Failed to update order status");
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(
    orderId: string,
    userId: string,
    reason?: string
  ): Promise<Order> {
    try {
      const order = await this.orderRepository.findOne({
        where: { id: orderId, userId },
      });

      if (!order) {
        throw new NotFoundException("Order not found");
      }

      if (!order.isCancellable) {
        throw new BadRequestException("Order cannot be cancelled");
      }

      order.status = OrderStatus.CANCELLED;
      order.cancelledAt = new Date();
      order.cancelledBy = userId;
      order.cancellationReason = reason;

      const updatedOrder = await this.orderRepository.save(order);

      // Refund B3TR to user
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (user) {
        user.b3trBalance += order.totalPrice;
        await this.userRepository.save(user);
      }

      // Restore product stock
      const product = await this.productRepository.findOne({
        where: { id: order.productId },
      });

      if (product) {
        product.stockQuantity += order.quantity;
        product.soldCount -= order.quantity;
        await this.productRepository.save(product);
      }

      this.logger.log(`Order cancelled: ${orderId}`);
      return updatedOrder;
    } catch (error) {
      this.logger.error(`Failed to cancel order: ${error.message}`);
      throw new BadRequestException("Failed to cancel order");
    }
  }

  /**
   * Get all orders (admin only)
   */
  async getAllOrders(
    page: number = 1,
    limit: number = 20,
    status?: OrderStatus
  ): Promise<{
    orders: Order[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const offset = (page - 1) * limit;

      const query = this.orderRepository
        .createQueryBuilder("order")
        .leftJoinAndSelect("order.product", "product")
        .leftJoinAndSelect("order.user", "user");

      if (status) {
        query.where("order.status = :status", { status });
      }

      const total = await query.getCount();
      const orders = await query
        .skip(offset)
        .take(limit)
        .orderBy("order.createdAt", "DESC")
        .getMany();

      return {
        orders,
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error(`Failed to get all orders: ${error.message}`);
      throw new BadRequestException("Failed to get orders");
    }
  }
}
