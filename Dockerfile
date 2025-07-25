# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY package*.json ./
RUN npm ci --only=production --no-optional
COPY --from=builder /app/dist ./dist
EXPOSE 3000
# Force production mode and use explicit start command
ENV NODE_ENV=production
ENV npm_config_production=true
CMD ["npm", "run", "start:prod"]