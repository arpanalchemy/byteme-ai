# Use official Node.js image as the base
FROM node:20-alpine as builder
# Add cache busting
ARG CACHEBUST=1
RUN echo "Cache bust: ${CACHEBUST}"
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --production=false
RUN npm install -g @nestjs/cli
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY . .
RUN npm run build

# Production image
FROM node:20-alpine as production
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
RUN npm ci --only=production
COPY --from=builder /usr/src/app/dist ./dist
EXPOSE 3000
# Use production start command
ENV PORT=3000
CMD ["npm", "run", "start:prod"]