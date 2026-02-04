# syntax=docker/dockerfile:1

###########################
# Base image
###########################
FROM node:22.13.0-alpine AS base
WORKDIR /usr/src/app
RUN apk add --no-cache libc6-compat

###########################
# Dev stage
###########################
FROM base AS dev
ENV NODE_ENV=development
COPY package.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

###########################
# Build stage
###########################
FROM base AS build
ENV NODE_ENV=development
COPY package*.json ./
# 🔧 On installe TOUTES les dépendances (dev + prod)
RUN npm ci
COPY . .
# On build le projet (TypeScript → JS)
RUN npm run build

###########################
# Production stage
###########################
FROM node:22.13.0-alpine AS prod
RUN apk add --no-cache libc6-compat && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /usr/src/app
ENV NODE_ENV=production

# On installe uniquement les dépendances de prod
COPY --chown=nodejs:nodejs package*.json ./
RUN npm ci --omit=dev --ignore-scripts && \
    npm cache clean --force

# On copie le build compilé depuis la phase "build"
COPY --chown=nodejs:nodejs --from=build /usr/src/app/dist ./dist

# Dossier logs
RUN mkdir -p /usr/src/app/logs && chown -R nodejs:nodejs /usr/src/app/logs

USER nodejs
EXPOSE 80

# Lancement du serveur
CMD ["node", "--no-deprecation", "./dist/src/server.js"]
