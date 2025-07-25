# Development-focused Dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Set development mode
ENV NODE_ENV=development
ENV PORT=3000

# Install NestJS CLI globally first
RUN npm install -g @nestjs/cli

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies)
RUN npm install

# Copy source code and config files
COPY . .

# Expose port
EXPOSE 3000

# Start in development mode with hot-reload
CMD ["npm", "run", "start:dev"]