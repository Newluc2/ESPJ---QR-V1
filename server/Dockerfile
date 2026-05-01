# Server Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app

# Install deps
COPY server/package*.json ./
RUN npm ci --only=production

# Copy source
COPY server/ ./

EXPOSE 5000
ENV NODE_ENV=production

CMD ["node", "src/index.js"]
