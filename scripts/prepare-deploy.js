/**
 * Atlas City - Deployment Preparedness Script (Node.js)
 * Ensures environment variables and Prisma client are ready for build.
 */

const { execSync } = require('child_process');

console.log("🚀 [DEPLOY] Starting pre-flight checks...");

const projectMode = process.env.PROJECT_MODE || 'internal/dev';

// 1. Validate Environment
if (projectMode === 'production') {
    console.log("🔍 [CHECK] Validating Production Environment...");
    if (!process.env.DATABASE_URL) {
        console.error("❌ [ERROR] DATABASE_URL is missing! PostgreSQL required for production.");
        process.exit(1);
    }
    if (!process.env.DIRECT_URL) {
        console.warn("⚠️ [WARN] DIRECT_URL is missing. Connection pooling might be unstable.");
    }
} else {
    console.log(`ℹ️ [INFO] Running in ${projectMode} mode.`);
}

// 2. Prisma Generate
try {
    console.log("⚙️ [PRISMA] Generating client...");
    execSync('npx prisma generate', { stdio: 'inherit' });
} catch (error) {
    console.error("❌ [ERROR] Prisma generation failed:", error.message);
    process.exit(1);
}

console.log("✅ [SUCCESS] Pre-flight checks passed.");
