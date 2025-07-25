# Vehicle Management API

## Overview

The Vehicle Management API provides comprehensive functionality for managing user vehicles in the ByteMe AI Drive & Earn platform. This module handles vehicle creation, updates, analytics, and integration with the odometer upload system.

## Features

- **Vehicle CRUD Operations**: Create, read, update, and delete vehicles
- **Multi-Vehicle Support**: Users can manage multiple vehicles
- **Primary Vehicle Management**: Set and manage primary vehicles
- **Vehicle Analytics**: Get detailed analytics and statistics
- **Search and Filtering**: Advanced search with pagination
- **Plate Number Validation**: Validate and check uniqueness of plate numbers
- **Emission Factor Management**: Bulk update emission factors
- **Vehicle Type Statistics**: Get statistics by vehicle type

## API Endpoints

### Base URL
```
/vehicles
```

### Authentication
All endpoints require JWT authentication with the `Authorization: Bearer <token>` header.

## Endpoints

### 1. Create Vehicle
**POST** `/vehicles`

Creates a new vehicle for the authenticated user.

**Request Body:**
```json
{
  "vehicleType": "car",
  "make": "Tesla",
  "model": "Model 3",
  "year": 2023,
  "plateNumber": "ABC123",
  "emissionFactor": 0.2,
  "isPrimary": false,
  "fuelType": "electric",
  "batteryCapacity": 75,
  "rangeKm": 400,
  "manufacturingCountry": "USA",
  "color": "Red",
  "vin": "1HGBH41JXMN109186"
}
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "vehicleType": "car",
  "make": "Tesla",
  "model": "Model 3",
  "year": 2023,
  "plateNumber": "ABC123",
  "emissionFactor": 0.2,
  "totalMileage": 0,
  "totalCarbonSaved": 0,
  "isPrimary": false,
  "isActive": true,
  "fuelType": "electric",
  "batteryCapacity": 75,
  "rangeKm": 400,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "displayName": "Tesla Model 3",
  "carbonSavedFormatted": "0.00 kg CO₂"
}
```

### 2. Get User Vehicles
**GET** `/vehicles`

Retrieves all vehicles for the authenticated user.

**Response:**
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "vehicleType": "car",
    "make": "Tesla",
    "model": "Model 3",
    "totalMileage": 15000.5,
    "totalCarbonSaved": 3000.1,
    "isPrimary": true,
    "displayName": "Tesla Model 3"
  }
]
```

### 3. Get Primary Vehicle
**GET** `/vehicles/primary`

Retrieves the primary vehicle for the authenticated user.

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "vehicleType": "car",
  "make": "Tesla",
  "model": "Model 3",
  "isPrimary": true,
  "displayName": "Tesla Model 3"
}
```

### 4. Get Vehicle Statistics
**GET** `/vehicles/stats`

Retrieves overall vehicle statistics for the authenticated user.

**Response:**
```json
{
  "totalVehicles": 3,
  "totalMileage": 45000.5,
  "totalCarbonSaved": 9000.3,
  "averageEmissionFactor": 0.22
}
```

### 5. Search Vehicles
**GET** `/vehicles/search`

Search vehicles with filtering and pagination.

**Query Parameters:**
- `vehicleType` (optional): Filter by vehicle type
- `make` (optional): Filter by manufacturer
- `model` (optional): Filter by model
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sortBy` (optional): Sort field (createdAt, updatedAt, totalMileage, totalCarbonSaved)
- `sortOrder` (optional): Sort order (ASC, DESC)

**Response:**
```json
{
  "vehicles": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "vehicleType": "car",
      "make": "Tesla",
      "model": "Model 3",
      "displayName": "Tesla Model 3"
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 10
}
```

### 6. Get Vehicle by ID
**GET** `/vehicles/:id`

Retrieves a specific vehicle by ID.

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "vehicleType": "car",
  "make": "Tesla",
  "model": "Model 3",
  "year": 2023,
  "plateNumber": "ABC123",
  "emissionFactor": 0.2,
  "totalMileage": 15000.5,
  "totalCarbonSaved": 3000.1,
  "isPrimary": true,
  "isActive": true,
  "fuelType": "electric",
  "batteryCapacity": 75,
  "rangeKm": 400,
  "displayName": "Tesla Model 3",
  "carbonSavedFormatted": "3000.10 kg CO₂"
}
```

### 7. Update Vehicle
**PUT** `/vehicles/:id`

Updates a specific vehicle.

**Request Body:**
```json
{
  "make": "Tesla",
  "model": "Model S",
  "emissionFactor": 0.18,
  "isPrimary": true
}
```

### 8. Delete Vehicle
**DELETE** `/vehicles/:id`

Soft deletes a vehicle (sets isActive to false).

**Response:**
```json
{
  "message": "Vehicle deleted successfully"
}
```

### 9. Set Primary Vehicle
**PUT** `/vehicles/:id/primary`

Sets a vehicle as the primary vehicle for the user.

### 10. Get Vehicle Analytics
**GET** `/vehicles/:id/analytics`

Retrieves detailed analytics for a specific vehicle.

**Response:**
```json
{
  "vehicleId": "123e4567-e89b-12d3-a456-426614174000",
  "totalMileage": 15000.5,
  "totalCarbonSaved": 3000.1,
  "averageMileagePerUpload": 500.2,
  "carbonEfficiency": 0.2,
  "lastActivity": "2024-01-15T10:30:00Z",
  "uploadCount": 30
}
```

### 11. Get Vehicle Upload History
**GET** `/vehicles/:id/history`

Retrieves upload history for a specific vehicle.

**Response:**
```json
[
  {
    "id": "upload-id",
    "uploadDate": "2024-01-15T10:30:00Z",
    "mileage": 15000,
    "carbonSaved": 25.5
  }
]
```

### 12. Get Vehicle Type Statistics
**GET** `/vehicles/types/stats`

Retrieves statistics grouped by vehicle type.

**Response:**
```json
[
  {
    "type": "car",
    "count": 2,
    "totalMileage": 30000.5,
    "totalCarbonSaved": 6000.2
  },
  {
    "type": "motorcycle",
    "count": 1,
    "totalMileage": 15000.0,
    "totalCarbonSaved": 3000.1
  }
]
```

### 13. Bulk Update Emission Factors
**POST** `/vehicles/bulk/emission-factors`

Updates emission factors for multiple vehicles.

**Request Body:**
```json
[
  {
    "vehicleId": "123e4567-e89b-12d3-a456-426614174000",
    "emissionFactor": 0.18
  },
  {
    "vehicleId": "456e7890-e89b-12d3-a456-426614174000",
    "emissionFactor": 0.15
  }
]
```

### 14. Validate Plate Number
**GET** `/vehicles/validate/plate-number/:plateNumber`

Validates a plate number format and uniqueness.

**Response:**
```json
{
  "plateNumber": "ABC123",
  "isValid": true,
  "isUnique": true,
  "canUse": true
}
```

### 15. Validate Plate Number for Update
**GET** `/vehicles/validate/plate-number/:plateNumber/:vehicleId`

Validates a plate number for updating a specific vehicle (excludes current vehicle from uniqueness check).

## Vehicle Types

The API supports the following vehicle types:

- `car` - Passenger car
- `suv` - Sport Utility Vehicle
- `motorcycle` - Motorcycle
- `scooter` - Electric scooter
- `truck` - Commercial truck
- `van` - Van
- `other` - Other vehicle types

## Fuel Types

Supported fuel types:

- `electric` - Electric vehicle
- `hybrid` - Hybrid vehicle
- `gasoline` - Gasoline vehicle
- `diesel` - Diesel vehicle
- `other` - Other fuel types

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Invalid vehicle data",
  "error": "Bad Request"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Vehicle not found",
  "error": "Not Found"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

## Validation Rules

### Vehicle Creation/Update
- `vehicleType`: Required, must be a valid vehicle type
- `year`: Optional, must be between 1900 and current year + 1
- `emissionFactor`: Optional, must be between 0 and 1
- `plateNumber`: Optional, must match format `/^[A-Z0-9\s\-]{2,10}$/i`

### Search Parameters
- `page`: Must be >= 1
- `limit`: Must be between 1 and 100
- `sortBy`: Must be one of: createdAt, updatedAt, totalMileage, totalCarbonSaved
- `sortOrder`: Must be ASC or DESC

## Integration with Other Modules

### Odometer Upload Integration
- Vehicles are linked to odometer uploads via `vehicleId`
- Vehicle statistics are updated when uploads are processed
- Vehicle matching is performed during upload processing

### User Integration
- Vehicles belong to users via `userId`
- User statistics include aggregated vehicle data
- Primary vehicle affects default upload behavior

## Database Schema

The vehicle entity includes the following key fields:

- Basic Information: `vehicleType`, `make`, `model`, `year`
- Identification: `plateNumber`, `vin`
- Environmental: `emissionFactor`, `fuelType`, `batteryCapacity`, `rangeKm`
- Statistics: `totalMileage`, `totalCarbonSaved`, `lastUploadDate`
- Status: `isActive`, `isPrimary`
- Metadata: `createdAt`, `updatedAt`

## Performance Considerations

- All queries are indexed on `userId` and `isActive`
- Pagination is implemented for large result sets
- Soft deletes are used to maintain data integrity
- Caching can be implemented for frequently accessed data

## Security

- All endpoints require authentication
- Users can only access their own vehicles
- Input validation prevents injection attacks
- Plate number validation ensures data quality 