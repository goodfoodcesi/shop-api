# syntax=docker/dockerfile:1

FROM node:22.13.0-alpine AS base
WORKDIR /usr/src/app
RUN apk add --no-cache libc6-compat

# ----- DEV -----
FROM base AS dev
ENV NODE_ENV=development
COPY package*.json ./
COPY prisma ./prisma/
RUN --mount=type=cache,target=/root/.npm \
    npm ci --ignore-scripts && \
    npx prisma generate

COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ----- BUILD -----
FROM base AS build
ENV NODE_ENV=production
COPY package*.json ./
COPY prisma ./prisma/
RUN --mount=type=cache,target=/root/.npm \
    npm ci --ignore-scripts
COPY . .
RUN npx prisma generate && \
    npm run build

# ----- PROD -----
FROM node:22.13.0-alpine AS prod
RUN apk add --no-cache libc6-compat && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY --chown=nodejs:nodejs package*.json ./
COPY --chown=nodejs:nodejs prisma ./prisma/
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --no-audit --no-fund --ignore-scripts && \
    npx prisma generate && \
    npm cache clean --force
COPY --chown=nodejs:nodejs --from=build /usr/src/app/dist ./dist
RUN mkdir -p /usr/src/app/logs && chown -R nodejs:nodejs /usr/src/app/logs
USER nodejs
EXPOSE 80
CMD ["node", "--no-deprecation", "./dist/src/server.js"]