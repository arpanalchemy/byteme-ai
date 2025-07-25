import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle, VehicleType } from '../entity/vehicle.entity';
import { CreateVehicleFromUploadDto } from '../../odometer/dto/upload-odometer.dto';

export interface CreateVehicleDto {
  vehicleType: VehicleType;
  make?: string;
  model?: string;
  year?: number;
  plateNumber?: string;
  emissionFactor?: number;
  isPrimary?: boolean;
}

export interface UpdateVehicleDto {
  vehicleType?: VehicleType;
  make?: string;
  model?: string;
  year?: number;
  plateNumber?: string;
  emissionFactor?: number;
  isPrimary?: boolean;
  isActive?: boolean;
}

@Injectable()
export class VehicleService {
  private readonly logger = new Logger(VehicleService.name);

  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
  ) {}

  /**
   * Create new vehicle
   */
  async createVehicle(
    userId: string,
    createDto: CreateVehicleDto,
  ): Promise<Vehicle> {
    try {
      this.logger.log(`Creating vehicle for user: ${userId}`);

      // If this is the first vehicle, make it primary
      const existingVehicles = await this.vehicleRepository.count({
        where: { userId, isActive: true },
      });

      const isPrimary = existingVehicles === 0 || createDto.isPrimary;

      // If setting as primary, unset other primary vehicles
      if (isPrimary) {
        await this.vehicleRepository.update(
          { userId, isPrimary: true },
          { isPrimary: false },
        );
      }

      const vehicle = this.vehicleRepository.create({
        userId,
        vehicleType: createDto.vehicleType,
        make: createDto.make,
        model: createDto.model,
        year: createDto.year,
        plateNumber: createDto.plateNumber,
        emissionFactor:
          createDto.emissionFactor ||
          this.getDefaultEmissionFactor(createDto.vehicleType),
        isPrimary,
        isActive: true,
      });

      const savedVehicle = await this.vehicleRepository.save(vehicle);

      this.logger.log(`Vehicle created: ${savedVehicle.id}`);
      return savedVehicle;
    } catch (error) {
      this.logger.error(`Failed to create vehicle: ${error.message}`);
      throw new BadRequestException('Failed to create vehicle');
    }
  }

  /**
   * Create vehicle from upload analysis
   */
  async createVehicleFromUpload(
    userId: string,
    createDto: CreateVehicleFromUploadDto,
  ): Promise<Vehicle> {
    try {
      this.logger.log(`Creating vehicle from upload for user: ${userId}`);

      const vehicleDto: CreateVehicleDto = {
        vehicleType: createDto.vehicleType,
        make: createDto.make,
        model: createDto.model,
        year: createDto.year,
        plateNumber: createDto.plateNumber,
        emissionFactor: createDto.emissionFactor,
      };

      return this.createVehicle(userId, vehicleDto);
    } catch (error) {
      this.logger.error(
        `Failed to create vehicle from upload: ${error.message}`,
      );
      throw new BadRequestException('Failed to create vehicle from upload');
    }
  }

  /**
   * Update vehicle
   */
  async updateVehicle(
    vehicleId: string,
    userId: string,
    updateDto: UpdateVehicleDto,
  ): Promise<Vehicle> {
    try {
      this.logger.log(`Updating vehicle: ${vehicleId}`);

      const vehicle = await this.vehicleRepository.findOne({
        where: { id: vehicleId, userId },
      });

      if (!vehicle) {
        throw new NotFoundException('Vehicle not found');
      }

      // If setting as primary, unset other primary vehicles
      if (updateDto.isPrimary) {
        await this.vehicleRepository.update(
          { userId, isPrimary: true },
          { isPrimary: false },
        );
      }

      // Update vehicle
      Object.assign(vehicle, updateDto);
      const updatedVehicle = await this.vehicleRepository.save(vehicle);

      this.logger.log(`Vehicle updated: ${vehicleId}`);
      return updatedVehicle;
    } catch (error) {
      this.logger.error(`Failed to update vehicle: ${error.message}`);
      throw new BadRequestException('Failed to update vehicle');
    }
  }

  /**
   * Delete vehicle (soft delete)
   */
  async deleteVehicle(vehicleId: string, userId: string): Promise<void> {
    try {
      this.logger.log(`Deleting vehicle: ${vehicleId}`);

      const vehicle = await this.vehicleRepository.findOne({
        where: { id: vehicleId, userId },
      });

      if (!vehicle) {
        throw new NotFoundException('Vehicle not found');
      }

      // Soft delete
      vehicle.isActive = false;
      await this.vehicleRepository.save(vehicle);

      this.logger.log(`Vehicle deleted: ${vehicleId}`);
    } catch (error) {
      this.logger.error(`Failed to delete vehicle: ${error.message}`);
      throw new BadRequestException('Failed to delete vehicle');
    }
  }

  /**
   * Get vehicle by ID
   */
  async getVehicleById(vehicleId: string, userId: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id: vehicleId, userId, isActive: true },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return vehicle;
  }

  /**
   * Get user vehicles
   */
  async getUserVehicles(userId: string): Promise<Vehicle[]> {
    return this.vehicleRepository.find({
      where: { userId, isActive: true },
      order: { isPrimary: 'DESC', createdAt: 'ASC' },
    });
  }

  /**
   * Get primary vehicle
   */
  async getPrimaryVehicle(userId: string): Promise<Vehicle | null> {
    return this.vehicleRepository.findOne({
      where: { userId, isPrimary: true, isActive: true },
    });
  }

  /**
   * Set vehicle as primary
   */
  async setPrimaryVehicle(vehicleId: string, userId: string): Promise<Vehicle> {
    try {
      this.logger.log(`Setting vehicle as primary: ${vehicleId}`);

      // Unset current primary vehicle
      await this.vehicleRepository.update(
        { userId, isPrimary: true },
        { isPrimary: false },
      );

      // Set new primary vehicle
      const vehicle = await this.vehicleRepository.findOne({
        where: { id: vehicleId, userId, isActive: true },
      });

      if (!vehicle) {
        throw new NotFoundException('Vehicle not found');
      }

      vehicle.isPrimary = true;
      const updatedVehicle = await this.vehicleRepository.save(vehicle);

      this.logger.log(`Primary vehicle set: ${vehicleId}`);
      return updatedVehicle;
    } catch (error) {
      this.logger.error(`Failed to set primary vehicle: ${error.message}`);
      throw new BadRequestException('Failed to set primary vehicle');
    }
  }

  /**
   * Update vehicle mileage and carbon savings
   */
  async updateVehicleStats(
    vehicleId: string,
    mileage: number,
    carbonSaved: number,
  ): Promise<void> {
    try {
      await this.vehicleRepository.update(vehicleId, {
        totalMileage: mileage,
        totalCarbonSaved: carbonSaved,
        lastUploadDate: new Date(),
      });
    } catch (error) {
      this.logger.error(`Failed to update vehicle stats: ${error.message}`);
    }
  }

  /**
   * Get vehicle statistics
   */
  async getVehicleStats(userId: string): Promise<any> {
    try {
      const vehicles = await this.vehicleRepository.find({
        where: { userId, isActive: true },
      });

      const totalMileage = vehicles.reduce(
        (sum, vehicle) => sum + vehicle.totalMileage,
        0,
      );
      const totalCarbonSaved = vehicles.reduce(
        (sum, vehicle) => sum + vehicle.totalCarbonSaved,
        0,
      );

      return {
        totalVehicles: vehicles.length,
        totalMileage,
        totalCarbonSaved,
        averageEmissionFactor:
          vehicles.length > 0
            ? vehicles.reduce(
                (sum, vehicle) => sum + vehicle.emissionFactor,
                0,
              ) / vehicles.length
            : 0,
      };
    } catch (error) {
      this.logger.error(`Failed to get vehicle stats: ${error.message}`);
      return {
        totalVehicles: 0,
        totalMileage: 0,
        totalCarbonSaved: 0,
        averageEmissionFactor: 0,
      };
    }
  }

  /**
   * Get default emission factor for vehicle type
   */
  private getDefaultEmissionFactor(vehicleType: VehicleType): number {
    const emissionFactors = {
      [VehicleType.CAR]: 0.2,
      [VehicleType.SUV]: 0.25,
      [VehicleType.MOTORCYCLE]: 0.1,
      [VehicleType.SCOOTER]: 0.08,
      [VehicleType.TRUCK]: 0.4,
      [VehicleType.VAN]: 0.3,
      [VehicleType.OTHER]: 0.2,
    };

    return emissionFactors[vehicleType] || 0.2;
  }

  /**
   * Validate vehicle data
   */
  validateVehicleData(createDto: CreateVehicleDto): boolean {
    if (!createDto.vehicleType) {
      return false;
    }

    if (
      createDto.year &&
      (createDto.year < 1900 || createDto.year > new Date().getFullYear() + 1)
    ) {
      return false;
    }

    if (
      createDto.emissionFactor &&
      (createDto.emissionFactor < 0 || createDto.emissionFactor > 1)
    ) {
      return false;
    }

    return true;
  }

  /**
   * Search vehicles by criteria
   */
  async searchVehicles(userId: string, criteria: any): Promise<Vehicle[]> {
    try {
      const query = this.vehicleRepository
        .createQueryBuilder('vehicle')
        .where('vehicle.userId = :userId', { userId })
        .andWhere('vehicle.isActive = :isActive', { isActive: true });

      if (criteria.vehicleType) {
        query.andWhere('vehicle.vehicleType = :vehicleType', {
          vehicleType: criteria.vehicleType,
        });
      }

      if (criteria.make) {
        query.andWhere('LOWER(vehicle.make) LIKE LOWER(:make)', {
          make: `%${criteria.make}%`,
        });
      }

      if (criteria.model) {
        query.andWhere('LOWER(vehicle.model) LIKE LOWER(:model)', {
          model: `%${criteria.model}%`,
        });
      }

      return query.getMany();
    } catch (error) {
      this.logger.error(`Failed to search vehicles: ${error.message}`);
      return [];
    }
  }
}
