# ByteMe AI Frontend

A comprehensive AI-powered platform for sustainable transportation that gamifies environmental consciousness through blockchain technology and advanced OCR capabilities.

## 🚀 Overview

ByteMe AI is a Next.js-based web application that encourages sustainable transportation by tracking vehicle odometer readings, calculating carbon savings, and rewarding users with tokens and badges. The platform features both user-facing and admin panels with advanced OCR (Optical Character Recognition) capabilities.

## ✨ Key Features

### 🏠 Landing Page
- **Interactive Hero Section** with animated dashboard-style elements
- **Real-time Statistics** display (users, vehicles, carbon saved, tokens distributed)
- **Features Showcase** highlighting platform capabilities
- **How It Works** section explaining the user journey
- **Rewards & Gamification** overview
- **FAQ Section** for common questions
- **Call-to-Action** sections for user engagement

### 👤 User Panel

#### 📊 Dashboard
- **Overview Tab**: User statistics, recent activity, and achievements
- **Vehicle History**: Track all vehicle uploads and odometer readings
- **Badges System**: Earn and display achievement badges
- **Leaderboard**: Compete with other users and view rankings
- **Token Store**: Manage and spend earned tokens
- **User Orders**: View purchase history and order status

#### 📸 Odometer Upload System
- **Dual OCR Technology**: 
  - Server-side API processing with intelligent fallback
  - Client-side Tesseract.js OCR for reliability
  - Advanced image preprocessing for better accuracy
- **Smart Vehicle Management**:
  - Vehicle selection for authenticated users
  - Manual input for anonymous users
  - Add new vehicles through modal interface
- **Long Polling API**: Up to 5 retry attempts for reliable data fetching
- **Real-time Processing Status**: Unified UI showing upload, fetching, and OCR processing states
- **Error Handling**: Graceful fallback with client-side OCR when API fails

#### 👤 Profile Management
- **Vehicle Management**: Add, edit, and manage multiple vehicles
- **User Information**: Update personal details and preferences
- **Achievement Tracking**: View earned badges and milestones

#### 📜 History
- **Upload History**: Complete record of all odometer submissions
- **Processing Status**: Track API and OCR processing results
- **Carbon Impact**: View environmental contribution over time

#### 🏆 Active Challenges
- **Current Challenges**: View and participate in ongoing environmental challenges
- **Challenge Progress**: Track personal progress and achievements
- **Reward Opportunities**: See available rewards and token earnings
- **Leaderboard Integration**: Compare performance with other participants

#### 🛒 Store & Shopping
- **Product Catalog**: Browse products from admin-managed store
- **Product Categories**: Filter by vehicle types, accessories, and eco-friendly items
- **Shopping Cart**: Add items and manage cart contents
- **Secure Checkout**: Complete purchases using earned tokens or traditional payment
- **Product Reviews**: View and leave reviews for purchased items

#### 📦 Orders Management
- **Order History**: Complete list of all purchases and transactions
- **Order Status Tracking**: Real-time updates on order processing, shipping, and delivery
- **Order Details**: View specific order information, items, and tracking
- **Order Cancellation**: Cancel pending orders within allowed timeframe
- **Order Support**: Contact support for order-related issues

### 🔧 Admin Panel

#### 📊 Admin Dashboard
- **System Analytics**: User growth, vehicle types, upload status charts
- **Real-time Statistics**: Total users, vehicles, carbon saved, tokens distributed
- **Performance Metrics**: Weekly rewards, pending uploads, order management

#### 👥 User Management
- **User List**: View and manage all registered users
- **User Details**: Individual user profiles and activity
- **Account Management**: User status and permissions

#### 🚗 Vehicle Management
- **Vehicle Database**: Comprehensive vehicle information
- **Type Classification**: Two-wheeler, three-wheeler, four-wheeler support
- **Registration Tracking**: Number plate and model management

#### 🏆 Challenges & Badges
- **Challenge Creation**: Design and manage environmental challenges
- **Challenge Management**: Set duration, goals, and reward structures
- **Badge System**: Create and award achievement badges
- **Reward Distribution**: Token and reward management
- **Participant Tracking**: Monitor user participation and progress
- **Leaderboard Management**: Manage challenge rankings and statistics

#### 🛒 Store Management
- **Product Catalog**: Manage store products and inventory
- **Product Categories**: Organize products by vehicle types and accessories
- **Order Processing**: Handle user orders and fulfillment
- **Inventory Control**: Stock management and tracking
- **Order Status Updates**: Update order processing, shipping, and delivery status
- **Customer Support**: Manage order-related customer inquiries

#### 🎁 Rewards System
- **Token Distribution**: Manage reward token allocation
- **Participant Tracking**: Monitor challenge participation
- **Reward Analytics**: Distribution statistics and reporting

#### ⚙️ Settings
- **System Configuration**: Platform settings and preferences
- **API Management**: Backend service configuration
- **Security Settings**: Authentication and authorization controls

## 🛠️ Technical Stack

### Frontend Framework
- **Next.js 15.4.3** with App Router
- **React 19.1.0** with TypeScript
- **Tailwind CSS 4** for styling
- **Framer Motion** for animations

### State Management
- **Redux Toolkit** for global state management
- **Redux Persist** for state persistence
- **React Redux** for React integration

### UI Components
- **Radix UI** for accessible components
- **Lucide React** for icons
- **Shadcn/ui** component library
- **React Hot Toast** for notifications

### OCR & AI
- **Tesseract.js** for client-side OCR
- **Advanced Image Preprocessing** for better accuracy
- **Vehicle-specific Pattern Matching** for odometer extraction
- **Confidence Scoring** for result validation

### Blockchain Integration
- **VeChain DApp Kit** for blockchain connectivity
- **Wallet Integration** for token management

### Data Visualization
- **ApexCharts** for analytics and charts
- **React ApexCharts** for React integration

### Development Tools
- **ESLint** for code linting
- **TypeScript** for type safety
- **PostCSS** for CSS processing

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd byteme-ai-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example env
   # Edit env file with your configuration
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
byteme-ai-frontend/
├── app/                          # Next.js App Router
│   ├── (user)/                   # User panel routes
│   │   ├── dashboard/            # User dashboard
│   │   ├── uploads/              # Odometer upload system
│   │   ├── profile/              # User profile management
│   │   └── history/              # Upload history
│   ├── admin/                    # Admin panel routes
│   │   ├── dashboard/            # Admin analytics
│   │   ├── users/                # User management
│   │   ├── products/             # Store management
│   │   ├── orders/               # Order processing
│   │   ├── challenges/           # Challenge management
│   │   ├── badges/               # Badge system
│   │   ├── rewards/              # Reward distribution
│   │   └── settings/             # System settings
│   ├── contact-support/          # Support page
│   ├── documentation/            # Documentation
│   └── components/               # App-specific components
├── components/                   # Reusable components
│   ├── auth/                     # Authentication components
│   ├── dashboard/                # Dashboard components
│   ├── landing/                  # Landing page components
│   ├── modals/                   # Modal components
│   ├── rewards/                  # Reward components
│   ├── store/                    # Store components
│   └── ui/                       # UI components
├── lib/                          # Utility libraries
│   ├── api/                      # API configuration
│   └── apiHelpers/               # API helper functions
├── redux/                        # Redux store and slices
├── public/                       # Static assets
└── types/                        # TypeScript type definitions
```

## 📜 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🔧 Environment Variables

Create an `env` file based on `env.example` with the following variables:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=your_api_base_url
NEXT_PUBLIC_API_TIMEOUT=30000

# Blockchain Configuration
NEXT_PUBLIC_VECHAIN_NETWORK=mainnet
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address

# OCR Configuration
NEXT_PUBLIC_OCR_TIMEOUT=30000
NEXT_PUBLIC_OCR_CONFIDENCE_THRESHOLD=30

# Feature Flags
NEXT_PUBLIC_ENABLE_CLIENT_OCR=true
NEXT_PUBLIC_ENABLE_BLOCKCHAIN=true
```

## 🔐 Authentication

The platform supports multiple authentication methods:
- **Wallet Connection** via VeChain DApp Kit
- **Traditional Authentication** (if configured)
- **Guest Mode** for anonymous users

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop computers
- Tablets
- Mobile devices
- Various screen sizes and orientations

## 🎨 UI/UX Features

- **Dark/Light Theme** support
- **Smooth Animations** using Framer Motion
- **Loading States** and skeleton screens
- **Error Handling** with user-friendly messages
- **Accessibility** compliant components
- **Progressive Web App** capabilities

## 🗃️ State Management

The application uses Redux Toolkit for state management with the following slices:
- **User Slice**: Authentication and user data
- **Odometer Slice**: Upload processing and OCR results
- **Admin Slice**: Admin panel state
- **Modal Slice**: Modal visibility management
- **Store Slice**: E-commerce functionality

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

### Other Platforms
The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- DigitalOcean App Platform
- Self-hosted servers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the documentation at `/documentation`
- Contact support at `/contact-support`
- Open an issue on GitHub

## 🗺️ Future Roadmap

- **Mobile App** development
- **Advanced Analytics** dashboard
- **Social Features** for community building
- **Integration** with more blockchain networks
- **AI-powered** route optimization
- **Carbon Credit** marketplace
- **Vehicle-to-Grid** integration

---

**ByteMe AI** - Driving the future of sustainable transportation through technology and gamification.
