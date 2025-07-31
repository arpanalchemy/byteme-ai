# EV Miles Rewards Mobile App - Comprehensive Project Documentation

## 🚀 Project Overview

### **Project Name**: EV Miles Rewards

**Version**: 0.0.1  
**Platform**: React Native (iOS & Android)  
**Bundle ID**: `com.alchemytech.ev.miles.rewards`

### **Project Description**

EV Miles Rewards is a mobile application designed to incentivize electric vehicle usage through a gamified rewards system. Users can upload odometer readings, participate in challenges, earn rewards, and compete on leaderboards.

### **Key Features**

- 📱 Cross-platform mobile app (iOS & Android)
- 🔐 Secure authentication with email OTP
- 📸 OCR-powered odometer reading extraction
- 🏆 Gamified rewards and challenges system
- 📊 Leaderboard and ranking system
- 🛒 In-app store for rewards redemption
- 👤 User profile management

---

## 🏗️ Technical Architecture

### **Technology Stack**

- **Framework**: React Native 0.80.1
- **Language**: TypeScript 5.0.4
- **Navigation**: React Navigation v7
- **State Management**: React Context API
- **Authentication**: JWT with Keychain storage
- **OCR**: Google ML Kit (Offline)
- **UI Components**: React Native Vector Icons
- **Testing**: Jest with React Native Testing Library

### **Project Structure**

```
src/
├── components/          # Reusable UI components
├── contexts/           # React Context providers
├── navigation/         # Navigation configuration
├── screens/           # App screens
│   ├── auth/         # Authentication screens
│   └── ...           # Main app screens
├── services/          # Business logic & API services
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
└── config/           # App configuration
```

### **Core Dependencies**

```json
{
  "@react-native-async-storage/async-storage": "^2.2.0",
  "@react-native-ml-kit/text-recognition": "^1.5.2",
  "@react-navigation/bottom-tabs": "^7.4.2",
  "@react-navigation/native": "^7.1.14",
  "@react-navigation/stack": "^7.4.2",
  "axios": "^1.11.0",
  "react-native-bootsplash": "^6.3.10",
  "react-native-keychain": "^10.0.0",
  "react-native-permissions": "^5.4.2",
  "react-native-toast-message": "^2.3.3",
  "react-native-vector-icons": "^10.3.0"
}
```

---

## 🎯 Features & Functionality

### **Authentication Flow**

1. **Welcome Screen**: App introduction and onboarding
2. **Email Login**: User enters email address
3. **OTP Verification**: 6-digit code sent to email
4. **Main App**: Access to all features after authentication

### **Core Features**

#### **📸 Upload Screen**

- Camera integration for odometer photos
- OCR processing for automatic reading extraction
- Vehicle details form
- Multiple reading selection when needed
- Permission handling for camera and photo library

#### **🏆 Challenges Screen**

- Gamified challenges for EV users
- Progress tracking
- Reward earning opportunities

#### **📊 Leaderboard Screen**

- User rankings and scores
- Competition features
- Achievement display

#### **🛒 Store Screen**

- Reward redemption
- Available items and rewards
- Purchase flow

#### **🎁 Rewards Screen**

- Earned rewards display
- Reward history
- Redemption status

#### **👤 Profile Screen**

- User profile management
- Settings and preferences
- Logout functionality

---

## 🔌 API Integration

### **API Configuration**

- **Base URL**: `https://byteme-ai.alchemytech.in`
- **Timeout**: 30 seconds (45 seconds for iOS)
- **Authentication**: Bearer token in Authorization header
- **Error Handling**: Comprehensive error handling with automatic logout on 401

### **API Endpoints**

#### **Authentication**

```typescript
// Email Login
POST /user/login
Body: { "email": "user@example.com" }
Response: { "message": "Login code sent to your email address" }

// OTP Verification
POST /user/verify-otp
Body: { "email": "user@example.com", "otp": "123456" }
Response: { "message": "OTP verified", "token": "jwt_token" }
```

### **API Service Features**

- **Request/Response Interceptors**: Automatic token injection and error handling
- **Token Management**: Automatic token storage and refresh
- **Error Recovery**: Automatic logout on authentication failures
- **Platform-Specific Handling**: iOS and Android specific configurations

---

## 🔐 Authentication System

### **Security Features**

- **JWT Token Storage**: Secure storage in device keychain
- **Automatic Token Injection**: Tokens automatically added to API requests
- **Session Management**: Persistent authentication across app restarts
- **Secure Logout**: Complete token cleanup on logout

### **Keychain Integration**

```typescript
// Token Storage Service
class TokenStorage {
  async storeTokens(token: string, email: string): Promise<void>;
  async getAccessToken(): Promise<string | null>;
  async getUserEmail(): Promise<string | null>;
  async isAuthenticated(): Promise<boolean>;
  async clearTokens(): Promise<void>;
}
```

### **Authentication Flow**

1. User enters email → API call to `/user/login`
2. OTP sent to email → User enters 6-digit code
3. OTP verification → API call to `/user/verify-otp`
4. JWT token received → Stored securely in keychain
5. User authenticated → Access to main app features

---

## 📸 OCR Implementation

### **OCR Features**

- **Offline Processing**: Google ML Kit for text recognition
- **Automatic Detection**: Intelligent odometer reading extraction
- **Multiple Readings**: User selection when multiple readings detected
- **Error Handling**: Comprehensive error handling with retry functionality

### **OCR Processing Flow**

```typescript
// OCR Service
class OcrService {
  static async recognizeText(imagePath: string): Promise<OcrResult>;
  static extractAllDigitSequences(ocrResult: OcrResult): string[];
  static filterPotentialReadings(allDigits: string[]): string[];
  static extractOdometerReading(ocrResult: OcrResult): OdometerReading;
}
```

### **Permission Management**

- **Camera Permission**: Required for taking odometer photos
- **Photo Library Permission**: Required for selecting existing photos
- **Cross-Platform**: Unified permission handling for iOS and Android
- **User-Friendly Prompts**: Contextual alerts and settings integration

---

## 🧪 Testing Strategy

### **Test Coverage**

The project includes comprehensive test suites covering:

#### **API Integration Tests**

- `EmailLoginAPI.test.tsx`: Email login API testing
- `OTPVerificationAPI.test.tsx`: OTP verification testing
- `EmailLoginRobustness.test.tsx`: Robustness testing

#### **Authentication Tests**

- `TokenStorage.test.tsx`: Token storage functionality
- `KeychainCleanup.test.tsx`: Keychain cleanup operations

#### **UI Component Tests**

- `OTPScreen.test.tsx`: OTP screen functionality
- `ToastIntegration.test.tsx`: Toast notification system

### **Testing Framework**

- **Jest**: Primary testing framework
- **React Native Testing Library**: Component testing
- **Mock Services**: Comprehensive mock implementations
- **Error Scenario Testing**: Network errors, API failures, etc.

---

## 📱 Platform Configuration

### **iOS Configuration**

- **Bundle ID**: `com.alchemytech.ev.miles.rewards`
- **Permissions**: Camera, Photo Library
- **Vector Icons**: Font files configured in Info.plist
- **Keychain**: Secure token storage
- **App Transport Security**: Configured for API calls

### **Android Configuration**

- **Package Name**: `com.alchemytech.ev.miles.rewards`
- **Permissions**: Camera, Storage, Network
- **ML Kit**: Offline text recognition
- **Keystore**: Secure token storage
- **Vector Icons**: Font files in assets

### **Platform-Specific Features**

- **iOS**: Keychain integration, vector icons setup
- **Android**: ML Kit integration, file system handling
- **Cross-Platform**: Unified API for permissions and storage

---

## 🛠️ Development Setup

### **Prerequisites**

- Node.js >= 18
- React Native CLI
- Xcode (for iOS development)
- Android Studio (for Android development)
- CocoaPods (for iOS dependencies)

### **Installation Steps**

```bash
# Clone repository
git clone https://git.alchemytech.in/projects/BYT/repos/byteme-ai-mobile/browse
cd byteme-ai-mobile

# Install dependencies
npm install

# iOS setup
cd ios
bundle install
bundle exec pod install
cd ..

# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### **Development Scripts**

```json
{
  "scripts": {
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "start": "react-native start",
    "test": "jest",
    "lint": "eslint ."
  }
}
```

---

## 📁 Project Files & Organization

### **Core Application Files**

- `App.tsx`: Main application component
- `package.json`: Dependencies and scripts
- `app.json`: App configuration
- `metro.config.js`: Metro bundler configuration
- `babel.config.js`: Babel configuration

### **Source Code Structure**

```
src/
├── components/          # 8 test components
├── contexts/           # AuthContext for state management
├── navigation/         # AppNavigator with auth flow
├── screens/           # 11 screens (6 auth + 5 main)
├── services/          # 8 service files
├── types/            # Navigation type definitions
├── utils/            # 7 utility files
└── config/           # Toast configuration
```

### **Platform-Specific Files**

```
ios/
├── EV_Odometer/      # iOS app configuration
├── Podfile          # CocoaPods dependencies
└── Podfile.lock     # Locked dependency versions

android/
├── app/             # Android app configuration
├── build.gradle     # Build configuration
└── gradle/          # Gradle wrapper
```

### **Documentation Files**

- `README.md`: Basic React Native setup guide
- `EMAIL_LOGIN_API_INTEGRATION.md`: API integration details
- `OCR_IMPLEMENTATION.md`: OCR implementation guide
- `VECTOR_ICONS_IOS_SETUP.md`: iOS vector icons setup

---

## 🔗 External Resources

### **Development Tools**

- **JIRA Board**: https://jira.alchemytech.in/secure/RapidBoard.jspa?rapidView=207&projectKey=BA#
- **Design Files**: https://www.figma.com/design/OJGonxOWnK9gvCPKBIkIy1/Earnleafs?node-id=395-10990
- **API Documentation**: https://byteme-ai.alchemytech.in/api

### **Testing Resources**

- **Test Reports**: Available in `__tests__/` directory
- **Mock API**: Implemented in `src/services/testApi.ts`
- **Test Components**: Available in `src/components/`

### **Configuration Files**

- **iOS**: `ios/EV_Odometer/Info.plist`, `ios/Podfile`
- **Android**: `android/app/build.gradle`, `android/app/src/main/AndroidManifest.xml`
- **Metro**: `metro.config.js`
- **Babel**: `babel.config.js`

### **Dependencies**

- **React Native**: 0.80.1
- **Navigation**: React Navigation v7
- **UI**: React Native Vector Icons
- **Storage**: React Native Keychain
- **OCR**: Google ML Kit
- **Permissions**: React Native Permissions

### **App Links**

- **iOS Testflight**: https://appstoreconnect.apple.com/teams/69a6de7a-f58d-47e3-e053-5b8c7c11a4d1/apps/6749042409/testflight/ios
- **Android APK**: https://drive.google.com/file/d/1cQEwugrrNRqkvWOrP68eeSMxfPf1FFrp/view?usp=drive_link

## 📞 Contact Information

For any questions or clarifications regarding this documentation, please contact the development team.

---

## 🎯 Project Status

### **Completed Features**

✅ Cross-platform React Native app setup  
✅ Authentication system with email OTP  
✅ OCR implementation for odometer reading  
✅ API integration with centralized configuration  
✅ Secure token storage with keychain  
✅ Permission handling for camera and photo library  
✅ Navigation system with auth flow  
✅ Toast notification system  
✅ Comprehensive test suite  
✅ Platform-specific configurations

### **In Progress**

🔄 User profile management enhancements  
🔄 Offline mode implementation  
🔄 Push notification system  
🔄 Analytics integration
🔄 Reward and Histrory API integration

### **Planned Features**

📋 User registration or login flow with In-App Wallent Connect
📋 Advanced reward system  
📋 Social features  
📋 Performance optimizations
📋 On Device OCR with TensorFlow

---

## 🔧 Technical Specifications

### **Minimum Requirements**

- **iOS**: iOS 12.0+
- **Android**: API level 21+ (Android 5.0+)
- **React Native**: 0.80.1
- **Node.js**: >= 18

### **Build Configuration**

- **iOS**: Xcode 14.0+
- **Android**: Android Studio Arctic Fox+
- **CocoaPods**: 1.11.0+
- **Gradle**: 7.5+

### **Development Environment**

- **IDE**: VS Code, Xcode, Android Studio
- **Version Control**: Git
- **Package Manager**: npm
- **Testing**: Jest + React Native Testing Library

---

_This documentation was last updated on: 31st July 2025_
_Project Version: 0.0.1_
_Documentation Version: 1.0.0_
