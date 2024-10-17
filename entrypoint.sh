#!/bin/bash
# Exit script in case of error
set -e

echo "Running Prisma Migrations..."

bun run prisma generate
bun run prisma migrate deploy
bun run seed:prod

echo "Building the application..."
bun run build

echo "Starting Application..."
bun run start
