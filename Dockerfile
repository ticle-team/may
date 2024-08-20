FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
ENV HOME=/app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN apk add --no-cache aws-cli
RUN --mount=type=cache,target=/app/.next echo "START" &&\
    yarn prisma generate &&\
    K8S_ENV=dev yarn build && \
    yarn asset:push:dev &&\
    cp -rf .next .next.dev && \
    K8S_ENV=prod yarn build && \
    yarn asset:push:prod &&\
    cp -rf .next .next.prod

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Set the correct permission for prerender cache
RUN mkdir -p dev/.next &&\
    chown -R nextjs:nodejs dev &&\
    ln -s ../public dev/public &&\
    ln -s ../prisma dev/prisma

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next.dev/standalone ./dev/

# Set the correct permission for prerender cache
RUN mkdir -p prod/.next &&\
    chown -R nextjs:nodejs prod &&\
    ln -s ../public prod/public && \
    ln -s ../prisma prod/prisma

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next.prod/standalone ./prod/

USER nextjs

EXPOSE 3000

ENV PORT 3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
#CMD HOSTNAME="0.0.0.0" node server.js