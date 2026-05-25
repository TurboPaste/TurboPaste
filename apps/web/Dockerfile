# Build from the monorepo root:
# docker build -f apps/web/Dockerfile -t turbopaste-web .

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

ENV VITE_SERVER_URL=__VITE_SERVER_URL_PLACEHOLDER__
ENV VITE_DOCS_URL=__VITE_DOCS_URL_PLACEHOLDER__

COPY --from=installer /app .

RUN pnpm turbo build --filter=web

FROM nginx:alpine AS runner

COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY apps/web/entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
