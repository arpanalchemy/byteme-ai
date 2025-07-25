# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Install all dependencies including dev dependencies
RUN npm ci
# Install NestJS CLI globally for development
RUN npm install -g @nestjs/cli
COPY . .
RUN npm run build

# Development stage
FROM node:20-alpine
WORKDIR /app
# Set development mode
ENV NODE_ENV=development
ENV PORT=3000
# Copy all files
COPY package*.json ./
# Install all dependencies including dev dependencies
RUN npm ci
# Install NestJS CLI globally for watch mode
RUN npm install -g @nestjs/cli
# Copy source and built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig*.json ./
COPY --from=builder /app/nest-cli.json ./
EXPOSE 3000
# Run in development mode with watch
CMD ["npm", "run", "start:dev"]