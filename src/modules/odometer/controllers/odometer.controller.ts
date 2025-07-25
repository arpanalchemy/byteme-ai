import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  Body,
  UseGuards,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { OdometerService } from '../services/odometer.service';
import { VehicleService } from '../../vehicles/services/vehicle.service';
import {
  UploadOdometerDto,
  ProcessOdometerDto,
  CreateVehicleFromUploadDto,
  OdometerUploadResponseDto,
  ProcessingResultDto,
  UserStatsDto,
} from '../dto/upload-odometer.dto';
import { User } from '../../users/entity/user.entity';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Odometer')
@Controller('odometer')
// @UseGuards(JwtAuthGuard)
// @ApiBearerAuth()
export class OdometerController {
  constructor(
    private readonly odometerService: OdometerService,
    private readonly vehicleService: VehicleService,
  ) {}

  @Public()
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, callback) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowedMimes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new BadRequestException('Invalid file type'), false);
        }
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Odometer image file',
        },
        vehicleId: {
          type: 'string',
          description: 'Optional vehicle ID',
        },
        notes: {
          type: 'string',
          description: 'Optional notes',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Upload started successfully',
    type: ProcessingResultDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid file or data' })
  // @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadOdometer(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadOdometerDto,
    // @CurrentUser() user: User,
  ): Promise<ProcessingResultDto> {
    console.log('1:03:21 PM');
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    return this.odometerService.uploadOdometer(file, '1', uploadDto);
  }

  @Post('process')
  @ApiBody({ type: ProcessOdometerDto })
  @ApiResponse({
    status: 201,
    description: 'Processing started successfully',
    type: ProcessingResultDto,
  })
  async processOdometer(
    @Body() processDto: ProcessOdometerDto,
    @CurrentUser() user: User,
  ): Promise<ProcessingResultDto> {
    // This endpoint would handle processing of already uploaded images
    // Implementation would be similar to upload but without file handling
    throw new BadRequestException('Not implemented yet');
  }

  @Post('upload/:uploadId/vehicle')
  @ApiBody({ type: CreateVehicleFromUploadDto })
  @ApiResponse({
    status: 201,
    description: 'Vehicle created from upload',
  })
  async createVehicleFromUpload(
    @Param('uploadId') uploadId: string,
    @Body() createVehicleDto: CreateVehicleFromUploadDto,
    @CurrentUser() user: User,
  ) {
    // Create new vehicle based on upload analysis
    const vehicle = await this.vehicleService.createVehicle(
      user.id,
      createVehicleDto,
    );

    // Update upload with new vehicle
    // Implementation would update the upload record

    return { vehicle, message: 'Vehicle created and linked to upload' };
  }

  @Get('uploads')
  @ApiResponse({
    status: 200,
    description: 'User uploads retrieved successfully',
    type: [OdometerUploadResponseDto],
  })
  async getUserUploads(
    @CurrentUser() user: User,
    @Query('limit', ParseIntPipe) limit = 20,
    @Query('offset', ParseIntPipe) offset = 0,
  ) {
    return this.odometerService.getUserUploads(user.id, limit, offset);
  }
  @Public()
  @Get('uploads/:uploadId')
  @ApiResponse({
    status: 200,
    description: 'Upload details retrieved successfully',
    type: OdometerUploadResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Upload not found' })
  async getUploadById(
    @Param('uploadId') uploadId: string,
    @CurrentUser() user?: User,
  ) {
    return this.odometerService.getUploadById(uploadId, user?.id);
  }

  @Get('stats')
  @ApiResponse({
    status: 200,
    description: 'User upload statistics',
    type: UserStatsDto,
  })
  async getUserStats(@CurrentUser() user: User): Promise<UserStatsDto> {
    return this.odometerService.getUserStats(user.id);
  }
}
