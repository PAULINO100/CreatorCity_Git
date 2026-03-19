#!/bin/bash

# Atlas City - Vercel Deploy Preparedness Script
# Usage: ./scripts/prepare-vercel-deploy.sh

echo "🚀 [DEPLOY] Starting pre-flight checks..."

# 1. Validate Environment
if [ "$PROJECT_MODE" = "production" ]; then
    echo "🔍 [CHECK] Validating Production Environment..."
    if [ -z "$DATABASE_URL" ]; then
        echo "❌ [ERROR] DATABASE_URL is missing! PostgreSQL required for production."
        exit 1
    fi
    if [ -z "$DIRECT_URL" ]; then
        echo "⚠️ [WARN] DIRECT_URL is missing. Connection pooling might be unstable."
    fi
else
    echo "ℹ️ [INFO] Running in $PROJECT_MODE mode."
fi

# 2. Schema Transformation (Optional - only if we swapped provider in code)
# In this implementation, we set PG as default in schema.prisma and 
# only swap to SQLite for local dev via setup-local-db.sh.

# 3. Prisma Generate
echo "⚙️ [PRISMA] Generating client..."
npx prisma generate

echo "✅ [SUCCESS] Pre-flight checks passed."
