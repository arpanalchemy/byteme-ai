# Use official Node.js image as the base
FROM node:20-alpine as builder
# Set NODE_ENV for build stage
ENV NODE_ENV=production
WORKDIR /usr/src/app
# Copy package files
COPY package*.json ./
# Install dependencies including devDependencies
RUN npm ci
# Install NestJS CLI globally for build
RUN npm install -g @nestjs/cli
# Copy source files
COPY . .
# Build the application
RUN npm run build

# Production image
FROM node:20-alpine as production
# Set NODE_ENV for production
ENV NODE_ENV=production
WORKDIR /usr/src/app
# Copy package files
COPY package*.json ./
# Install only production dependencies
RUN npm ci --only=production --ignore-scripts
# Copy built application
COPY --from=builder /usr/src/app/dist ./dist
# Expose port
ENV PORT=3000
EXPOSE 3000
# Start the application
CMD ["node", "dist/main"]