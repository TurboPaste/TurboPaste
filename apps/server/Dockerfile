# Build from the monorepo root:
# docker build -f apps/server/Dockerfile -t turbopaste-server .

FROM node:lts-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

FROM base AS builder
WORKDIR /app

COPY . .

RUN pnpm install --frozen-lockfile

RUN pnpm turbo build --filter=server

RUN pnpm -F server deploy /app/deploy --prod --ignore-scripts && \
    cp /app/node_modules/.pnpm/@prisma+engines@*/node_modules/@prisma/engines/schema-engine-* \
    /app/deploy/node_modules/.pnpm/@prisma+engines@*/node_modules/@prisma/engines/

FROM base AS runner
WORKDIR /app

RUN apk add --no-cache openssl

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs nodeuser

COPY --from=builder /app/deploy/node_modules ./node_modules
COPY --from=builder /app/apps/server/dist ./dist
COPY --from=builder /app/packages/db/prisma ./prisma
COPY --from=builder /app/packages/db/prisma.config.ts ./prisma.config.ts

COPY apps/server/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV PATH="/app/node_modules/.bin:$PATH"

USER nodeuser

EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]
