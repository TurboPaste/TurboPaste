#!/bin/sh

set -e

VITE_SERVER_URL="${VITE_SERVER_URL:-http://localhost:3000}"
VITE_DOCS_URL="${VITE_DOCS_URL:-http://localhost:4321}"

find /usr/share/nginx/html -type f \( -name "*.js" -o -name "*.html" \) \
  -exec sed -i \
    -e "s|__VITE_SERVER_URL_PLACEHOLDER__|${VITE_SERVER_URL}|g" \
    -e "s|__VITE_DOCS_URL_PLACEHOLDER__|${VITE_DOCS_URL}|g" \
  {} +

exec nginx -g "daemon off;"
