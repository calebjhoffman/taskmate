#!/bin/sh
set -e

echo "⏳ Waiting for PostgreSQL to be ready..."
until nc -z db 5432; do
  echo "❌ Database not ready. Retrying in 1s..."
  sleep 1
done

echo "✅ PostgreSQL is ready!"
echo "🚀 Starting development server..."
exec "$@"
