# Use official Node.js image as the base
FROM node:20-alpine as builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --production=false
COPY . .
RUN npm run build

# Production image
FROM node:20-alpine as production
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --production
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
EXPOSE 3000
RUN npm run build
CMD ["node", "dist/main.js"]