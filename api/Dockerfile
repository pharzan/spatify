# syntax=docker/dockerfile:1

FROM node:20-slim AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm ci

FROM base AS build
COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM node:20-slim AS migrate
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json tsconfig.json drizzle.config.ts ./
COPY src ./src
COPY scripts ./scripts
COPY --from=deps /app/node_modules ./node_modules
CMD ["npm", "run", "db:migrate"]

FROM node:20-slim AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules
RUN npm prune --omit=dev
COPY --from=build /app/dist ./dist
COPY drizzle.config.ts ./
COPY --from=build /app/src/db ./src/db
EXPOSE 3333
CMD ["node", "dist/server.js"]
