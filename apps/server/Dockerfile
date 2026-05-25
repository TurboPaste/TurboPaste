# Build from the monorepo root:
# docker build -f apps/server/Dockerfile -t turbopaste-server .

FROM node:lts-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

FROM base AS installer
WORKDIR /app

COPY . .

RUN pnpm install --frozen-lockfile --ignore-scripts

FROM base AS builder
WORKDIR /app

COPY --from=installer /app .

RUN pnpm turbo build --filter=server

RUN pnpm -F server deploy /app/deploy --prod --ignore-scripts && \
    cp -r /app/node_modules/.pnpm/prisma@*/node_modules/prisma /app/deploy/node_modules/prisma

FROM node:lts-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 --ingroup nodejs nodeuser

COPY --from=builder /app/deploy/node_modules ./node_modules
COPY --from=builder /app/apps/server/dist ./dist

COPY packages/db/prisma ./prisma

COPY apps/server/entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

USER nodeuser

EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]
