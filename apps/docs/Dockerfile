# Build from the monorepo root:
# docker build -f apps/docs/Dockerfile -t turbopaste-docs .

FROM node:lts-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

FROM base AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/docs/package.json ./apps/docs/

RUN pnpm -F docs install --frozen-lockfile

COPY apps/docs ./apps/docs

ENV PUBLIC_WEB_URL=__PUBLIC_WEB_URL_PLACEHOLDER__

RUN pnpm -F docs build

FROM nginx:alpine AS runner

COPY --from=builder /app/apps/docs/dist /usr/share/nginx/html
COPY apps/docs/nginx.conf /etc/nginx/conf.d/default.conf
COPY apps/docs/entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
