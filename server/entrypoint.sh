#!/bin/sh
set -e

npx prisma migrate deploy
exec node dist/src/main.js
