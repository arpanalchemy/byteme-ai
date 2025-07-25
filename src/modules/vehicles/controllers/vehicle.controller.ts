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
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import {
  VehicleService,
  CreateVehicleDto,
  UpdateVehicleDto,
} from '../services/vehicle.service';
import { Vehicle } from '../entity/vehicle.entity';
import { User } from '../../users/entity/user.entity';

@ApiTags('Vehicles')
@Controller('vehicles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: 'Vehicle created successfully',
    type: Vehicle,
  })
  @ApiResponse({ status: 400, description: 'Invalid vehicle data' })
  async createVehicle(
    @Body() createDto: CreateVehicleDto,
    @CurrentUser() user: User,
  ): Promise<Vehicle> {
    if (!this.vehicleService.validateVehicleData(createDto)) {
      throw new Error('Invalid vehicle data');
    }

    return this.vehicleService.createVehicle(user.id, createDto);
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'User vehicles retrieved successfully',
    type: [Vehicle],
  })
  async getUserVehicles(@CurrentUser() user: User): Promise<Vehicle[]> {
    return this.vehicleService.getUserVehicles(user.id);
  }

  @Get('primary')
  @ApiResponse({
    status: 200,
    description: 'Primary vehicle retrieved successfully',
    type: Vehicle,
  })
  async getPrimaryVehicle(@CurrentUser() user: User): Promise<Vehicle | null> {
    return this.vehicleService.getPrimaryVehicle(user.id);
  }

  @Get('stats')
  @ApiResponse({
    status: 200,
    description: 'Vehicle statistics retrieved successfully',
  })
  async getVehicleStats(@CurrentUser() user: User) {
    return this.vehicleService.getVehicleStats(user.id);
  }

  @Get('search')
  @ApiResponse({
    status: 200,
    description: 'Vehicles found successfully',
    type: [Vehicle],
  })
  async searchVehicles(
    @CurrentUser() user: User,
    @Query() criteria: any,
  ): Promise<Vehicle[]> {
    return this.vehicleService.searchVehicles(user.id, criteria);
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Vehicle retrieved successfully',
    type: Vehicle,
  })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  async getVehicleById(
    @Param('id') vehicleId: string,
    @CurrentUser() user: User,
  ): Promise<Vehicle> {
    return this.vehicleService.getVehicleById(vehicleId, user.id);
  }

  @Put(':id')
  @ApiResponse({
    status: 200,
    description: 'Vehicle updated successfully',
    type: Vehicle,
  })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  async updateVehicle(
    @Param('id') vehicleId: string,
    @Body() updateDto: UpdateVehicleDto,
    @CurrentUser() user: User,
  ): Promise<Vehicle> {
    return this.vehicleService.updateVehicle(vehicleId, user.id, updateDto);
  }

  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'Vehicle deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  async deleteVehicle(
    @Param('id') vehicleId: string,
    @CurrentUser() user: User,
  ): Promise<{ message: string }> {
    await this.vehicleService.deleteVehicle(vehicleId, user.id);
    return { message: 'Vehicle deleted successfully' };
  }

  @Put(':id/primary')
  @ApiResponse({
    status: 200,
    description: 'Primary vehicle set successfully',
    type: Vehicle,
  })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  async setPrimaryVehicle(
    @Param('id') vehicleId: string,
    @CurrentUser() user: User,
  ): Promise<Vehicle> {
    return this.vehicleService.setPrimaryVehicle(vehicleId, user.id);
  }
}
