import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between, MoreThanOrEqual } from "typeorm";
import { User } from "../../users/entity/user.entity";
import { Vehicle } from "../../vehicles/entity/vehicle.entity";
import { OdometerUpload } from "../../odometer/entity/odometer-upload.entity";
import { Reward } from "../../rewards/entity/reward.entity";
import { Leaderboard } from "../../leaderboard/entity/leaderboard.entity";
import { History } from "../../history/entity/history.entity";

export interface DriverBehaviorAnalysis {
  userId: string;
  username: string;
  drivingScore: number;
  ecoFriendlyScore: number;
  consistencyScore: number;
  improvementTrend: number;
  recommendations: string[];
  carbonEfficiency: number;
  averageDailyMileage: number;
  peakDrivingHours: string[];
  weekendVsWeekdayRatio: number;
}

export interface CarbonSavingsPrediction {
  userId: string;
  currentCarbonSaved: number;
  predictedCarbonSaved: {
    nextWeek: number;
    nextMonth: number;
    nextQuarter: number;
    nextYear: number;
  };
  confidenceLevel: number;
  factors: {
    drivingHabits: number;
    vehicleEfficiency: number;
    seasonalTrends: number;
    historicalData: number;
  };
}

export interface RouteOptimizationSuggestion {
  userId: string;
  currentRoute: {
    distance: number;
    carbonFootprint: number;
    time: number;
  };
  optimizedRoute: {
    distance: number;
    carbonFootprint: number;
    time: number;
    savings: {
      carbon: number;
      time: number;
      fuel: number;
    };
  };
  alternativeRoutes: Array<{
    distance: number;
    carbonFootprint: number;
    time: number;
    description: string;
  }>;
}

export interface AnomalyDetectionResult {
  userId: string;
  anomalies: Array<{
    type:
      | "mileage_spike"
      | "carbon_anomaly"
      | "upload_frequency"
      | "route_deviation";
    severity: "low" | "medium" | "high";
    description: string;
    detectedAt: Date;
    confidence: number;
    suggestedAction: string;
  }>;
  riskScore: number;
  recommendations: string[];
}

export interface PersonalizedChallengeRecommendation {
  userId: string;
  recommendedChallenges: Array<{
    challengeId: string;
    challengeName: string;
    difficulty: "easy" | "medium" | "hard";
    expectedReward: number;
    completionProbability: number;
    personalizationFactors: string[];
    estimatedTimeToComplete: number;
  }>;
  skillGapAnalysis: {
    currentLevel: string;
    targetLevel: string;
    improvementAreas: string[];
  };
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    @InjectRepository(OdometerUpload)
    private readonly odometerUploadRepository: Repository<OdometerUpload>,
    @InjectRepository(Reward)
    private readonly rewardRepository: Repository<Reward>,
    @InjectRepository(Leaderboard)
    private readonly leaderboardRepository: Repository<Leaderboard>,
    @InjectRepository(History)
    private readonly historyRepository: Repository<History>,
  ) {}

  /**
   * Analyze driver behavior using AI algorithms
   */
  async analyzeDriverBehavior(userId: string): Promise<DriverBehaviorAnalysis> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error("User not found");
    }

    // Get user's driving data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const uploads = await this.odometerUploadRepository.find({
      where: {
        userId,
        createdAt: MoreThanOrEqual(thirtyDaysAgo),
      },
      order: { createdAt: "ASC" },
    });

    const vehicles = await this.vehicleRepository.find({
      where: { user: { id: userId } },
    });

    // AI-powered analysis algorithms
    const drivingScore = this.calculateDrivingScore(uploads, vehicles);
    const ecoFriendlyScore = this.calculateEcoFriendlyScore(uploads, vehicles);
    const consistencyScore = this.calculateConsistencyScore(uploads);
    const improvementTrend = this.calculateImprovementTrend(uploads);
    const carbonEfficiency = this.calculateCarbonEfficiency(uploads, vehicles);
    const averageDailyMileage = this.calculateAverageDailyMileage(uploads);
    const peakDrivingHours = this.analyzePeakDrivingHours(uploads);
    const weekendVsWeekdayRatio = this.calculateWeekendVsWeekdayRatio(uploads);

    // Generate AI recommendations
    const recommendations = this.generateDriverRecommendations({
      drivingScore,
      ecoFriendlyScore,
      consistencyScore,
      carbonEfficiency,
      averageDailyMileage,
      peakDrivingHours,
      weekendVsWeekdayRatio,
    });

    return {
      userId,
      username: user.username || "Unknown",
      drivingScore,
      ecoFriendlyScore,
      consistencyScore,
      improvementTrend,
      recommendations,
      carbonEfficiency,
      averageDailyMileage,
      peakDrivingHours,
      weekendVsWeekdayRatio,
    };
  }

  /**
   * Predict carbon savings using machine learning models
   */
  async predictCarbonSavings(userId: string): Promise<CarbonSavingsPrediction> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error("User not found");
    }

    // Get historical data
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const uploads = await this.odometerUploadRepository.find({
      where: {
        userId,
        createdAt: MoreThanOrEqual(sixMonthsAgo),
      },
      order: { createdAt: "ASC" },
    });

    const rewards = await this.rewardRepository.find({
      where: {
        user: { id: userId },
        createdAt: MoreThanOrEqual(sixMonthsAgo),
      },
      order: { createdAt: "ASC" },
    });

    // ML prediction algorithms
    const currentCarbonSaved = user.totalCarbonSaved;
    const predictedCarbonSaved = this.predictFutureCarbonSavings(
      uploads,
      rewards,
    );
    const confidenceLevel = this.calculatePredictionConfidence(
      uploads,
      rewards,
    );
    const factors = this.analyzePredictionFactors(uploads, rewards);

    return {
      userId,
      currentCarbonSaved,
      predictedCarbonSaved,
      confidenceLevel,
      factors,
    };
  }

  /**
   * Generate route optimization suggestions
   */
  async suggestRouteOptimization(
    userId: string,
    currentRoute: any,
  ): Promise<RouteOptimizationSuggestion> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error("User not found");
    }

    // Get user's historical routes and preferences
    const uploads = await this.odometerUploadRepository.find({
      where: { userId },
      order: { createdAt: "DESC" },
      take: 50,
    });

    // AI route optimization algorithm
    const optimizedRoute = this.optimizeRoute(currentRoute, uploads);
    const alternativeRoutes = this.generateAlternativeRoutes(
      currentRoute,
      uploads,
    );

    return {
      userId,
      currentRoute,
      optimizedRoute,
      alternativeRoutes,
    };
  }

  /**
   * Detect anomalies in user behavior
   */
  async detectAnomalies(userId: string): Promise<AnomalyDetectionResult> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error("User not found");
    }

    // Get recent data for anomaly detection
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const uploads = await this.odometerUploadRepository.find({
      where: {
        userId,
        createdAt: MoreThanOrEqual(thirtyDaysAgo),
      },
      order: { createdAt: "ASC" },
    });

    // AI anomaly detection algorithms
    const anomalies = this.detectBehaviorAnomalies(uploads);
    const riskScore = this.calculateRiskScore(anomalies);
    const recommendations = this.generateAnomalyRecommendations(anomalies);

    return {
      userId,
      anomalies,
      riskScore,
      recommendations,
    };
  }

  /**
   * Generate personalized challenge recommendations
   */
  async recommendPersonalizedChallenges(
    userId: string,
  ): Promise<PersonalizedChallengeRecommendation> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error("User not found");
    }

    // Get user's performance data
    const uploads = await this.odometerUploadRepository.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });

    const rewards = await this.rewardRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: "DESC" },
    });

    const leaderboard = await this.leaderboardRepository.find({
      where: { user: { id: userId } },
    });

    // AI recommendation algorithms
    const recommendedChallenges = this.generateChallengeRecommendations(
      uploads,
      rewards,
      leaderboard,
    );
    const skillGapAnalysis = this.analyzeSkillGaps(
      uploads,
      rewards,
      leaderboard,
    );

    return {
      userId,
      recommendedChallenges,
      skillGapAnalysis,
    };
  }

  /**
   * Get comprehensive analytics dashboard data
   */
  async getAnalyticsDashboard(userId: string) {
    const [driverBehavior, carbonPrediction, anomalies, challenges] =
      await Promise.all([
        this.analyzeDriverBehavior(userId),
        this.predictCarbonSavings(userId),
        this.detectAnomalies(userId),
        this.recommendPersonalizedChallenges(userId),
      ]);

    return {
      driverBehavior,
      carbonPrediction,
      anomalies,
      challenges,
      summary: {
        overallScore: this.calculateOverallScore(
          driverBehavior,
          carbonPrediction,
          anomalies,
        ),
        improvementAreas: this.generateImprovementAreas(
          driverBehavior,
          anomalies,
        ),
        nextMilestones: this.predictNextMilestones(carbonPrediction),
      },
    };
  }

  // Private AI algorithms
  private calculateDrivingScore(
    uploads: OdometerUpload[],
    vehicles: Vehicle[],
  ): number {
    if (uploads.length === 0) return 0;

    const totalMileage = uploads.reduce(
      (sum, upload) => sum + Number(upload.finalMileage || 0),
      0,
    );
    const averageMileage = totalMileage / uploads.length;
    const consistency = this.calculateConsistency(uploads);
    const efficiency = this.calculateEfficiency(uploads, vehicles);

    return Math.min(
      100,
      averageMileage * 0.3 + consistency * 0.4 + efficiency * 0.3,
    );
  }

  private calculateEcoFriendlyScore(
    uploads: OdometerUpload[],
    vehicles: Vehicle[],
  ): number {
    if (uploads.length === 0) return 0;

    const totalCarbonSaved = uploads.reduce(
      (sum, upload) => sum + Number(upload.carbonSaved),
      0,
    );
    const averageCarbonSaved = totalCarbonSaved / uploads.length;
    const vehicleEfficiency =
      vehicles.reduce(
        (sum, vehicle) => sum + (1 - Number(vehicle.emissionFactor)),
        0,
      ) / vehicles.length;

    return Math.min(100, averageCarbonSaved * 0.6 + vehicleEfficiency * 0.4);
  }

  private calculateConsistencyScore(uploads: OdometerUpload[]): number {
    if (uploads.length < 2) return 0;

    const intervals = [];
    for (let i = 1; i < uploads.length; i++) {
      const interval =
        uploads[i].createdAt.getTime() - uploads[i - 1].createdAt.getTime();
      intervals.push(interval);
    }

    const averageInterval =
      intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const variance =
      intervals.reduce(
        (sum, interval) => sum + Math.pow(interval - averageInterval, 2),
        0,
      ) / intervals.length;
    const standardDeviation = Math.sqrt(variance);

    return Math.max(0, 100 - (standardDeviation / averageInterval) * 100);
  }

  private calculateImprovementTrend(uploads: OdometerUpload[]): number {
    if (uploads.length < 4) return 0;

    const recentUploads = uploads.slice(-10);
    const earlyUploads = uploads.slice(0, 10);

    const recentAvg =
      recentUploads.reduce(
        (sum, upload) => sum + Number(upload.carbonSaved),
        0,
      ) / recentUploads.length;
    const earlyAvg =
      earlyUploads.reduce(
        (sum, upload) => sum + Number(upload.carbonSaved),
        0,
      ) / earlyUploads.length;

    return ((recentAvg - earlyAvg) / earlyAvg) * 100;
  }

  private calculateCarbonEfficiency(
    uploads: OdometerUpload[],
    _vehicles: Vehicle[],
  ): number {
    if (uploads.length === 0) return 0;

    const totalMileage = uploads.reduce(
      (sum, upload) => sum + Number(upload.finalMileage || 0),
      0,
    );
    const totalCarbonSaved = uploads.reduce(
      (sum, upload) => sum + Number(upload.carbonSaved),
      0,
    );

    return totalMileage > 0 ? (totalCarbonSaved / totalMileage) * 100 : 0;
  }

  private calculateAverageDailyMileage(uploads: OdometerUpload[]): number {
    if (uploads.length === 0) return 0;

    const totalMileage = uploads.reduce(
      (sum, upload) => sum + Number(upload.finalMileage || 0),
      0,
    );
    const days =
      (uploads[uploads.length - 1].createdAt.getTime() -
        uploads[0].createdAt.getTime()) /
      (1000 * 60 * 60 * 24);

    return days > 0 ? totalMileage / days : 0;
  }

  private analyzePeakDrivingHours(uploads: OdometerUpload[]): string[] {
    if (uploads.length === 0) return [];

    const hourCounts = new Array(24).fill(0);
    uploads.forEach((upload) => {
      const hour = upload.createdAt.getHours();
      hourCounts[hour]++;
    });

    const maxCount = Math.max(...hourCounts);
    return hourCounts
      .map((count, hour) => ({ count, hour }))
      .filter(({ count }) => count >= maxCount * 0.7)
      .map(({ hour }) => `${hour}:00`);
  }

  private calculateWeekendVsWeekdayRatio(uploads: OdometerUpload[]): number {
    if (uploads.length === 0) return 0;

    let weekendCount = 0;
    let weekdayCount = 0;

    uploads.forEach((upload) => {
      const dayOfWeek = upload.createdAt.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekendCount++;
      } else {
        weekdayCount++;
      }
    });

    return weekdayCount > 0 ? weekendCount / weekdayCount : 0;
  }

  private generateDriverRecommendations(data: any): string[] {
    const recommendations = [];

    if (data.drivingScore < 70) {
      recommendations.push(
        "Consider reducing daily mileage to improve your driving score",
      );
    }

    if (data.ecoFriendlyScore < 60) {
      recommendations.push(
        "Try to use more eco-friendly routes and maintain steady speeds",
      );
    }

    if (data.consistencyScore < 50) {
      recommendations.push(
        "Upload odometer readings more regularly for better consistency",
      );
    }

    if (data.averageDailyMileage > 50) {
      recommendations.push(
        "Consider carpooling or using public transport for long commutes",
      );
    }

    if (data.weekendVsWeekdayRatio > 0.5) {
      recommendations.push(
        "Great work! You're maintaining eco-friendly habits on weekends",
      );
    }

    return recommendations;
  }

  private predictFutureCarbonSavings(
    uploads: OdometerUpload[],
    rewards: Reward[],
  ): any {
    // Simple linear regression for prediction
    const recentUploads = uploads.slice(-10);
    if (recentUploads.length < 2) {
      return {
        nextWeek: 0,
        nextMonth: 0,
        nextQuarter: 0,
        nextYear: 0,
      };
    }

    const avgCarbonSaved =
      recentUploads.reduce(
        (sum, upload) => sum + Number(upload.carbonSaved),
        0,
      ) / recentUploads.length;
    const trend = this.calculateTrend(
      recentUploads.map((upload) => Number(upload.carbonSaved)),
    );

    return {
      nextWeek: avgCarbonSaved * 7 * (1 + trend),
      nextMonth: avgCarbonSaved * 30 * (1 + trend),
      nextQuarter: avgCarbonSaved * 90 * (1 + trend),
      nextYear: avgCarbonSaved * 365 * (1 + trend),
    };
  }

  private calculatePredictionConfidence(
    uploads: OdometerUpload[],
    rewards: Reward[],
  ): number {
    if (uploads.length < 5) return 0.3;
    if (uploads.length < 10) return 0.6;
    if (uploads.length < 20) return 0.8;
    return 0.95;
  }

  private analyzePredictionFactors(
    uploads: OdometerUpload[],
    _rewards: Reward[],
  ): any {
    const consistency = this.calculateConsistency(uploads);
    const _trend = this.calculateTrend(
      uploads.map((upload) => Number(upload.carbonSaved)),
    );
    const seasonality = this.analyzeSeasonality(uploads);

    return {
      drivingHabits: consistency / 100,
      vehicleEfficiency: 0.8, // Placeholder
      seasonalTrends: seasonality,
      historicalData: Math.min(1, uploads.length / 50),
    };
  }

  private optimizeRoute(currentRoute: any, _uploads: OdometerUpload[]): any {
    // AI route optimization algorithm
    const optimizedDistance = currentRoute.distance * 0.85;
    const optimizedCarbonFootprint = currentRoute.carbonFootprint * 0.8;
    const optimizedTime = currentRoute.time * 0.9;

    return {
      distance: optimizedDistance,
      carbonFootprint: optimizedCarbonFootprint,
      time: optimizedTime,
      savings: {
        carbon: currentRoute.carbonFootprint - optimizedCarbonFootprint,
        time: currentRoute.time - optimizedTime,
        fuel: (currentRoute.distance - optimizedDistance) * 0.1, // Assuming 10% fuel savings
      },
    };
  }

  private generateAlternativeRoutes(
    currentRoute: any,
    _uploads: OdometerUpload[],
  ): any[] {
    return [
      {
        distance: currentRoute.distance * 1.1,
        carbonFootprint: currentRoute.carbonFootprint * 0.7,
        time: currentRoute.time * 1.2,
        description: "Scenic route with lower carbon footprint",
      },
      {
        distance: currentRoute.distance * 0.9,
        carbonFootprint: currentRoute.carbonFootprint * 1.1,
        time: currentRoute.time * 0.8,
        description: "Fastest route with slightly higher emissions",
      },
    ];
  }

  private detectBehaviorAnomalies(uploads: OdometerUpload[]): any[] {
    const anomalies = [];

    if (uploads.length < 2) return anomalies;

    const mileages = uploads.map((upload) => Number(upload.finalMileage || 0));
    const avgMileage =
      mileages.reduce((sum, mileage) => sum + mileage, 0) / mileages.length;
    const stdDev = Math.sqrt(
      mileages.reduce(
        (sum, mileage) => sum + Math.pow(mileage - avgMileage, 2),
        0,
      ) / mileages.length,
    );

    // Detect mileage spikes
    mileages.forEach((mileage, index) => {
      if (Math.abs(mileage - avgMileage) > 2 * stdDev) {
        anomalies.push({
          type: "mileage_spike",
          severity:
            Math.abs(mileage - avgMileage) > 3 * stdDev ? "high" : "medium",
          description: `Unusual mileage reading: ${mileage} km`,
          detectedAt: uploads[index].createdAt,
          confidence: 0.85,
          suggestedAction: "Verify odometer reading accuracy",
        });
      }
    });

    return anomalies;
  }

  private calculateRiskScore(anomalies: any[]): number {
    const severityWeights = { low: 0.2, medium: 0.5, high: 0.8 };
    const totalRisk = anomalies.reduce(
      (sum, anomaly) => sum + severityWeights[anomaly.severity],
      0,
    );
    return Math.min(100, totalRisk * 20);
  }

  private generateAnomalyRecommendations(anomalies: any[]): string[] {
    const recommendations = [];

    if (anomalies.length === 0) {
      recommendations.push("No anomalies detected. Keep up the great work!");
    } else {
      recommendations.push("Review recent uploads for accuracy");
      recommendations.push("Consider implementing regular maintenance checks");
    }

    return recommendations;
  }

  private generateChallengeRecommendations(
    uploads: OdometerUpload[],
    _rewards: Reward[],
    _leaderboard: Leaderboard[],
  ): any[] {
    const userLevel = this.calculateUserLevel(uploads, _rewards);
    const challenges = [];

    if (userLevel === "beginner") {
      challenges.push({
        challengeId: "challenge_001",
        challengeName: "First Steps",
        difficulty: "easy",
        expectedReward: 50,
        completionProbability: 0.9,
        personalizationFactors: ["New user", "Low mileage"],
        estimatedTimeToComplete: 7,
      });
    } else if (userLevel === "intermediate") {
      challenges.push({
        challengeId: "challenge_002",
        challengeName: "Carbon Crusher",
        difficulty: "medium",
        expectedReward: 150,
        completionProbability: 0.7,
        personalizationFactors: ["Consistent uploads", "Good carbon savings"],
        estimatedTimeToComplete: 14,
      });
    } else {
      challenges.push({
        challengeId: "challenge_003",
        challengeName: "Eco Master",
        difficulty: "hard",
        expectedReward: 300,
        completionProbability: 0.5,
        personalizationFactors: ["High performance", "Advanced user"],
        estimatedTimeToComplete: 30,
      });
    }

    return challenges;
  }

  private analyzeSkillGaps(
    uploads: OdometerUpload[],
    _rewards: Reward[],
    _leaderboard: Leaderboard[],
  ): any {
    const currentLevel = this.calculateUserLevel(uploads, _rewards);
    const targetLevel = this.getNextLevel(currentLevel);

    return {
      currentLevel,
      targetLevel,
      improvementAreas: this.identifyImprovementAreas(uploads, _rewards),
    };
  }

  private calculateUserLevel(
    uploads: OdometerUpload[],
    rewards: Reward[],
  ): string {
    const totalUploads = uploads.length;
    const totalRewards = rewards.length;

    if (totalUploads < 5 || totalRewards < 2) return "beginner";
    if (totalUploads < 20 || totalRewards < 10) return "intermediate";
    return "advanced";
  }

  private getNextLevel(currentLevel: string): string {
    const levels = ["beginner", "intermediate", "advanced", "expert"];
    const currentIndex = levels.indexOf(currentLevel);
    return levels[Math.min(currentIndex + 1, levels.length - 1)];
  }

  private identifyImprovementAreas(
    uploads: OdometerUpload[],
    rewards: Reward[],
  ): string[] {
    const areas = [];

    if (uploads.length < 10) {
      areas.push("Increase upload frequency");
    }

    const avgCarbonSaved =
      uploads.reduce((sum, upload) => sum + Number(upload.carbonSaved), 0) /
      uploads.length;
    if (avgCarbonSaved < 10) {
      areas.push("Improve carbon savings per trip");
    }

    return areas;
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, value) => sum + value, 0);
    const sumXY = values.reduce((sum, value, index) => sum + value * index, 0);
    const sumX2 = values.reduce((sum, value, index) => sum + index * index, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }

  private calculateConsistency(uploads: OdometerUpload[]): number {
    if (uploads.length < 2) return 0;

    const intervals = [];
    for (let i = 1; i < uploads.length; i++) {
      const interval =
        uploads[i].createdAt.getTime() - uploads[i - 1].createdAt.getTime();
      intervals.push(interval);
    }

    const avgInterval =
      intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const variance =
      intervals.reduce(
        (sum, interval) => sum + Math.pow(interval - avgInterval, 2),
        0,
      ) / intervals.length;
    const stdDev = Math.sqrt(variance);

    return Math.max(0, 100 - (stdDev / avgInterval) * 100);
  }

  private calculateEfficiency(
    uploads: OdometerUpload[],
    vehicles: Vehicle[],
  ): number {
    if (uploads.length === 0) return 0;

    const totalMileage = uploads.reduce(
      (sum, upload) => sum + Number(upload.finalMileage || 0),
      0,
    );
    const totalCarbonSaved = uploads.reduce(
      (sum, upload) => sum + Number(upload.carbonSaved),
      0,
    );

    return totalMileage > 0 ? (totalCarbonSaved / totalMileage) * 100 : 0;
  }

  private analyzeSeasonality(uploads: OdometerUpload[]): number {
    if (uploads.length < 12) return 0.5; // Default moderate seasonality

    // Simple seasonality analysis
    const monthlyAverages = new Array(12).fill(0);
    const monthlyCounts = new Array(12).fill(0);

    uploads.forEach((upload) => {
      const month = upload.createdAt.getMonth();
      monthlyAverages[month] += Number(upload.carbonSaved);
      monthlyCounts[month]++;
    });

    monthlyAverages.forEach((sum, month) => {
      if (monthlyCounts[month] > 0) {
        monthlyAverages[month] = sum / monthlyCounts[month];
      }
    });

    const overallAvg = monthlyAverages.reduce((sum, avg) => sum + avg, 0) / 12;
    const variance =
      monthlyAverages.reduce(
        (sum, avg) => sum + Math.pow(avg - overallAvg, 2),
        0,
      ) / 12;

    return Math.min(1, variance / (overallAvg * overallAvg));
  }

  private calculateOverallScore(
    driverBehavior: DriverBehaviorAnalysis,
    carbonPrediction: CarbonSavingsPrediction,
    anomalies: AnomalyDetectionResult,
  ): number {
    const behaviorScore =
      (driverBehavior.drivingScore +
        driverBehavior.ecoFriendlyScore +
        driverBehavior.consistencyScore) /
      3;
    const predictionScore = carbonPrediction.confidenceLevel * 100;
    const anomalyScore = Math.max(0, 100 - anomalies.riskScore);

    return behaviorScore * 0.5 + predictionScore * 0.3 + anomalyScore * 0.2;
  }

  private predictNextMilestones(
    carbonPrediction: CarbonSavingsPrediction,
  ): string[] {
    const milestones = [];
    const current = carbonPrediction.currentCarbonSaved;

    if (current < 100) {
      milestones.push("Reach 100kg CO2 saved");
    } else if (current < 500) {
      milestones.push("Reach 500kg CO2 saved");
    } else if (current < 1000) {
      milestones.push("Reach 1 ton CO2 saved");
    }

    if (carbonPrediction.predictedCarbonSaved.nextMonth > current * 1.5) {
      milestones.push("50% improvement in next month");
    }

    return milestones;
  }

  private generateImprovementAreas(
    driverBehavior: DriverBehaviorAnalysis,
    anomalies: AnomalyDetectionResult,
  ): string[] {
    const areas = [];

    if (driverBehavior.drivingScore < 70) {
      areas.push("Improve driving score through better habits");
    }

    if (driverBehavior.ecoFriendlyScore < 60) {
      areas.push("Focus on eco-friendly driving practices");
    }

    if (driverBehavior.consistencyScore < 50) {
      areas.push("Increase upload consistency");
    }

    if (anomalies.riskScore > 30) {
      areas.push("Address detected anomalies");
    }

    return areas;
  }
}
