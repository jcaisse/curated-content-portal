# syntax=docker/dockerfile:1.6
ARG NODE_VERSION=20
ARG TARGETPLATFORM

FROM node:${NODE_VERSION}-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --include=dev

FROM node:${NODE_VERSION}-bookworm-slim AS builder
WORKDIR /app
ARG TARGETPLATFORM
ENV PRISMA_CLI_TELEMETRY_INFORMATION="disable"
COPY --from=deps /app/node_modules ./node_modules

# Defensive clean to remove any legacy layers
RUN rm -rf prisma/migrations && mkdir -p prisma/migrations

# Copy ONLY what we need (explicit whitelist)
COPY package.json package-lock.json* tsconfig.json next.config.* tailwind.config.* postcss.config.* ./
COPY src src
COPY public public
COPY prisma prisma
COPY scripts scripts

# Generate Prisma Client for the target platform at build time
RUN node node_modules/.bin/prisma generate

        # Build Next.js (skip config validation during build)
        ENV SKIP_CONFIG_VALIDATION=true
        RUN npm run build -- --no-lint

FROM node:${NODE_VERSION}-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
# (Optional: show platform in logs)
RUN node -e "console.log('Runtime:', process.platform, process.arch)"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install curl, openssl, and postgresql-client for health checks and Prisma
RUN apt-get update && apt-get install -y curl openssl postgresql-client && rm -rf /var/lib/apt/lists/*

# Copy the built application
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma files and generated client with engines
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# Copy Prisma and dependencies for migrations
COPY --from=builder /app/node_modules ./node_modules

# Copy scripts directory
COPY --from=builder /app/scripts ./scripts

# Create crawlee storage directory with proper permissions before switching to nextjs user
RUN mkdir -p /tmp/crawlee-storage && chown -R nextjs:nodejs /tmp/crawlee-storage

USER nextjs

EXPOSE 3000

ENV HOSTNAME=0.0.0.0
ENV CRAWLEE_STORAGE_DIR=/tmp/crawlee-storage

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]