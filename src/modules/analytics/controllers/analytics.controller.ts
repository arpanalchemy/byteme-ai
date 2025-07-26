import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
} from "@nestjs/common";
import {
  ApiTags,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { AnalyticsService } from "../services/analytics.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { User } from "../../users/entity/user.entity";

@ApiTags("AI Analytics")
@Controller("analytics")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("driver-behavior/:userId")
  @ApiParam({ name: "userId", description: "User ID to analyze" })
  @ApiResponse({
    status: 200,
    description: "Driver behavior analysis retrieved successfully",
    schema: {
      type: "object",
      properties: {
        userId: { type: "string" },
        username: { type: "string" },
        drivingScore: { type: "number", example: 85.5 },
        ecoFriendlyScore: { type: "number", example: 78.2 },
        consistencyScore: { type: "number", example: 92.1 },
        improvementTrend: { type: "number", example: 15.3 },
        recommendations: {
          type: "array",
          items: { type: "string" },
          example: [
            "Consider reducing daily mileage",
            "Try eco-friendly routes",
          ],
        },
        carbonEfficiency: { type: "number", example: 0.045 },
        averageDailyMileage: { type: "number", example: 25.5 },
        peakDrivingHours: {
          type: "array",
          items: { type: "string" },
          example: ["8:00", "17:00"],
        },
        weekendVsWeekdayRatio: { type: "number", example: 0.3 },
      },
    },
  })
  async analyzeDriverBehavior(@Param("userId") userId: string) {
    return this.analyticsService.analyzeDriverBehavior(userId);
  }

  @Get("carbon-prediction/:userId")
  @ApiParam({ name: "userId", description: "User ID for carbon prediction" })
  @ApiResponse({
    status: 200,
    description: "Carbon savings prediction retrieved successfully",
    schema: {
      type: "object",
      properties: {
        userId: { type: "string" },
        currentCarbonSaved: { type: "number", example: 150.5 },
        predictedCarbonSaved: {
          type: "object",
          properties: {
            nextWeek: { type: "number", example: 25.3 },
            nextMonth: { type: "number", example: 108.7 },
            nextQuarter: { type: "number", example: 325.2 },
            nextYear: { type: "number", example: 1300.8 },
          },
        },
        confidenceLevel: { type: "number", example: 0.85 },
        factors: {
          type: "object",
          properties: {
            drivingHabits: { type: "number", example: 0.8 },
            vehicleEfficiency: { type: "number", example: 0.7 },
            seasonalTrends: { type: "number", example: 0.6 },
            historicalData: { type: "number", example: 0.9 },
          },
        },
      },
    },
  })
  async predictCarbonSavings(@Param("userId") userId: string) {
    return this.analyticsService.predictCarbonSavings(userId);
  }

  @Post("route-optimization/:userId")
  @ApiParam({ name: "userId", description: "User ID for route optimization" })
  @ApiResponse({
    status: 200,
    description: "Route optimization suggestions generated successfully",
    schema: {
      type: "object",
      properties: {
        userId: { type: "string" },
        currentRoute: {
          type: "object",
          properties: {
            distance: { type: "number", example: 15.5 },
            carbonFootprint: { type: "number", example: 2.3 },
            time: { type: "number", example: 25 },
          },
        },
        optimizedRoute: {
          type: "object",
          properties: {
            distance: { type: "number", example: 13.2 },
            carbonFootprint: { type: "number", example: 1.8 },
            time: { type: "number", example: 22 },
            savings: {
              type: "object",
              properties: {
                carbon: { type: "number", example: 0.5 },
                time: { type: "number", example: 3 },
                fuel: { type: "number", example: 0.23 },
              },
            },
          },
        },
        alternativeRoutes: {
          type: "array",
          items: {
            type: "object",
            properties: {
              distance: { type: "number" },
              carbonFootprint: { type: "number" },
              time: { type: "number" },
              description: { type: "string" },
            },
          },
        },
      },
    },
  })
  async suggestRouteOptimization(
    @Param("userId") userId: string,
    @Body() currentRoute: any,
  ) {
    return this.analyticsService.suggestRouteOptimization(userId, currentRoute);
  }

  @Get("anomaly-detection/:userId")
  @ApiParam({ name: "userId", description: "User ID for anomaly detection" })
  @ApiResponse({
    status: 200,
    description: "Anomaly detection results retrieved successfully",
    schema: {
      type: "object",
      properties: {
        userId: { type: "string" },
        anomalies: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: {
                type: "string",
                enum: [
                  "mileage_spike",
                  "carbon_anomaly",
                  "upload_frequency",
                  "route_deviation",
                ],
              },
              severity: { type: "string", enum: ["low", "medium", "high"] },
              description: { type: "string" },
              detectedAt: { type: "string", format: "date-time" },
              confidence: { type: "number" },
              suggestedAction: { type: "string" },
            },
          },
        },
        riskScore: { type: "number", example: 15.5 },
        recommendations: {
          type: "array",
          items: { type: "string" },
        },
      },
    },
  })
  async detectAnomalies(@Param("userId") userId: string) {
    return this.analyticsService.detectAnomalies(userId);
  }

  @Get("challenge-recommendations/:userId")
  @ApiParam({
    name: "userId",
    description: "User ID for challenge recommendations",
  })
  @ApiResponse({
    status: 200,
    description:
      "Personalized challenge recommendations retrieved successfully",
    schema: {
      type: "object",
      properties: {
        userId: { type: "string" },
        recommendedChallenges: {
          type: "array",
          items: {
            type: "object",
            properties: {
              challengeId: { type: "string" },
              challengeName: { type: "string" },
              difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
              expectedReward: { type: "number" },
              completionProbability: { type: "number" },
              personalizationFactors: {
                type: "array",
                items: { type: "string" },
              },
              estimatedTimeToComplete: { type: "number" },
            },
          },
        },
        skillGapAnalysis: {
          type: "object",
          properties: {
            currentLevel: { type: "string" },
            targetLevel: { type: "string" },
            improvementAreas: {
              type: "array",
              items: { type: "string" },
            },
          },
        },
      },
    },
  })
  async recommendPersonalizedChallenges(@Param("userId") userId: string) {
    return this.analyticsService.recommendPersonalizedChallenges(userId);
  }

  @Get("dashboard/:userId")
  @ApiParam({ name: "userId", description: "User ID for analytics dashboard" })
  @ApiResponse({
    status: 200,
    description: "Comprehensive analytics dashboard retrieved successfully",
    schema: {
      type: "object",
      properties: {
        driverBehavior: { type: "object" },
        carbonPrediction: { type: "object" },
        anomalies: { type: "object" },
        challenges: { type: "object" },
        summary: {
          type: "object",
          properties: {
            overallScore: { type: "number", example: 87.5 },
            improvementAreas: {
              type: "array",
              items: { type: "string" },
            },
            nextMilestones: {
              type: "array",
              items: { type: "string" },
            },
          },
        },
      },
    },
  })
  async getAnalyticsDashboard(@Param("userId") userId: string) {
    return this.analyticsService.getAnalyticsDashboard(userId);
  }

  @Get("my-analytics")
  @ApiResponse({
    status: 200,
    description: "Current user analytics retrieved successfully",
  })
  async getMyAnalytics(@CurrentUser() user: User) {
    return this.analyticsService.getAnalyticsDashboard(user.id);
  }

  @Get("comparison/:userId1/:userId2")
  @ApiParam({ name: "userId1", description: "First user ID for comparison" })
  @ApiParam({ name: "userId2", description: "Second user ID for comparison" })
  @ApiResponse({
    status: 200,
    description: "User comparison analytics retrieved successfully",
  })
  async compareUsers(
    @Param("userId1") userId1: string,
    @Param("userId2") userId2: string,
  ) {
    const [user1Analytics, user2Analytics] = await Promise.all([
      this.analyticsService.getAnalyticsDashboard(userId1),
      this.analyticsService.getAnalyticsDashboard(userId2),
    ]);

    return {
      user1: { id: userId1, analytics: user1Analytics },
      user2: { id: userId2, analytics: user2Analytics },
      comparison: {
        drivingScoreDifference:
          user1Analytics.driverBehavior.drivingScore -
          user2Analytics.driverBehavior.drivingScore,
        carbonEfficiencyDifference:
          user1Analytics.driverBehavior.carbonEfficiency -
          user2Analytics.driverBehavior.carbonEfficiency,
        overallScoreDifference:
          user1Analytics.summary.overallScore -
          user2Analytics.summary.overallScore,
      },
    };
  }

  @Get("trends/:userId")
  @ApiParam({ name: "userId", description: "User ID for trend analysis" })
  @ApiQuery({
    name: "period",
    required: false,
    enum: ["week", "month", "quarter", "year"],
    example: "month",
  })
  @ApiResponse({
    status: 200,
    description: "User trends analysis retrieved successfully",
  })
  async analyzeTrends(
    @Param("userId") userId: string,
    @Query("period") period: string = "month",
  ) {
    const [driverBehavior, carbonPrediction] = await Promise.all([
      this.analyticsService.analyzeDriverBehavior(userId),
      this.analyticsService.predictCarbonSavings(userId),
    ]);

    return {
      userId,
      period,
      trends: {
        drivingScore: {
          current: driverBehavior.drivingScore,
          trend: driverBehavior.improvementTrend,
          direction:
            driverBehavior.improvementTrend > 0 ? "improving" : "declining",
        },
        carbonSavings: {
          current: carbonPrediction.currentCarbonSaved,
          predicted: carbonPrediction.predictedCarbonSaved,
          growthRate: this.calculateGrowthRate(carbonPrediction),
        },
        consistency: {
          score: driverBehavior.consistencyScore,
          trend: this.calculateConsistencyTrend(driverBehavior),
        },
      },
      insights: this.generateTrendInsights(driverBehavior, carbonPrediction),
    };
  }

  private calculateGrowthRate(carbonPrediction: any): number {
    const current = carbonPrediction.currentCarbonSaved;
    const predicted = carbonPrediction.predictedCarbonSaved.nextMonth;
    return current > 0 ? ((predicted - current) / current) * 100 : 0;
  }

  private calculateConsistencyTrend(driverBehavior: any): number {
    // Simple trend calculation based on consistency score
    return driverBehavior.consistencyScore > 80
      ? 5
      : driverBehavior.consistencyScore > 60
        ? 2
        : -1;
  }

  private generateTrendInsights(
    driverBehavior: any,
    carbonPrediction: any,
  ): string[] {
    const insights = [];

    if (driverBehavior.improvementTrend > 10) {
      insights.push("Excellent improvement trend! Keep up the great work.");
    } else if (driverBehavior.improvementTrend > 0) {
      insights.push(
        "Good progress! Consider increasing your eco-friendly driving habits.",
      );
    } else {
      insights.push(
        "Room for improvement. Focus on consistent eco-friendly driving.",
      );
    }

    if (carbonPrediction.confidenceLevel > 0.8) {
      insights.push(
        "High confidence in predictions. Your data shows clear patterns.",
      );
    }

    if (driverBehavior.consistencyScore > 90) {
      insights.push(
        "Outstanding consistency! Your regular uploads help improve predictions.",
      );
    }

    return insights;
  }
}
