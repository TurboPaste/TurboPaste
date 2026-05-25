#!/bin/sh

set -e

echo "Running database migrations..."
node ./node_modules/prisma/build/index.js migrate deploy --schema ./prisma/schema

echo "Starting server..."
exec node dist/index.mjs
