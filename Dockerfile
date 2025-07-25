# Use official Node.js image as the base
FROM node:20-alpine as builder
# Set NODE_ENV for build stage
ENV NODE_ENV=production
WORKDIR /usr/src/app
# Copy package files
COPY package*.json ./
# Install all dependencies (including dev dependencies)
RUN npm ci
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
RUN npm ci --only=production
# Copy built application
COPY --from=builder /usr/src/app/dist ./dist
# Expose port
ENV PORT=3000
EXPOSE 3000
# Start the application
CMD ["node", "dist/main"]