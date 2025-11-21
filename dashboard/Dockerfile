# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app

# Needed for Next.js native modules such as `sharp`
RUN apk add --no-cache libc6-compat
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm i

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN npm run build && npm prune --omit=dev

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs \
  && adduser -S nextjs -G nodejs -u 1001
COPY --from=builder /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["npm", "run", "start"]
