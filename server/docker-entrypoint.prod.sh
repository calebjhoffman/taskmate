#!/bin/sh
set -e

echo "⏳ Waiting for PostgreSQL to be ready at taskmate-db.internal:5432..."
until nc -z taskmate-db.internal 5432; do
  echo "❌ Database not ready. Retrying in 1s..."
  sleep 1
done

echo "✅ PostgreSQL is ready!"
echo "📦 Running Prisma migration..."
npx prisma migrate deploy

echo "🚀 Starting the Express server..."
node index.js