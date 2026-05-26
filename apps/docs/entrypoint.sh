#!/bin/sh

set -e

PUBLIC_WEB_URL="${PUBLIC_WEB_URL:-http://localhost:3001}"

find /usr/share/nginx/html -type f \( -name "*.js" -o -name "*.html" \) \
  -exec sed -i \
    -e "s|__PUBLIC_WEB_URL_PLACEHOLDER__|${PUBLIC_WEB_URL}|g" \
  {} +

exec nginx -g "daemon off;"
