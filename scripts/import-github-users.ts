import { GitHubImportService } from "../src/lib/github/import-service";
import * as dotenv from "dotenv";

dotenv.config();

async function run() {
  const token = process.env.GITHUB_TOKEN;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PHASE 3C CONFIGURATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const MIN_STARS = 200;        // Start of range
  const MAX_STARS = 500;        // End of range to get fresh results
  const TOTAL_PAGES = 10;       // 10 pages × 100 = 1000 potential users
  const BATCH_PAUSE_AFTER = 200; // Pause every 200 users processed
  const BATCH_PAUSE_MS = 120000; // 2-minute pause between batches

  console.log("🏙️  Atlas City — Phase 3C: Massive GitHub Import (Wave 2)");
  console.log("  starRange: ", `${MIN_STARS}..${MAX_STARS}`);
  console.log("  pages:     ", TOTAL_PAGES);
  console.log("  batchPause:", `${BATCH_PAUSE_MS / 1000}s after every ${BATCH_PAUSE_AFTER} users`);
  console.log("");

  if (!token) {
    console.warn("⚠️  No GITHUB_TOKEN found in .env. Rate limits will be strict (60 req/h).");
    console.warn("   Set GITHUB_TOKEN in your .env file for 5000 req/h limit.");
    console.warn("");
  }

  const service = new GitHubImportService(token);

  try {
    const stats = await service.importMassive(MIN_STARS, TOTAL_PAGES, BATCH_PAUSE_AFTER, BATCH_PAUSE_MS, MAX_STARS);

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📊 PHASE 3C IMPORT COMPLETE");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`  Total Fetched:       ${stats.totalFetched}`);
    console.log(`  Users Created:       ${stats.usersCreated}`);
    console.log(`  Duplicates Skipped:  ${stats.duplicatesSkipped}`);
    console.log(`  Errors:              ${stats.errors.length}`);

    if (stats.errors.length > 0) {
      console.log("\n⚠️  Errors (first 10):");
      stats.errors.slice(0, 10).forEach((err) => console.log("  -", err));
      if (stats.errors.length > 10) console.log(`  ... and ${stats.errors.length - 10} more.`);
    }

    const success = stats.usersCreated >= 1000;
    console.log(`\n${success ? "✅" : "⚠️ "} Result: ${stats.usersCreated} citizens imported. ${!success ? "Run again to reach 1000." : "Metropolis ready!"}`);
  } catch (err: any) {
    console.error("❌ [FATAL] Import failed:", err.message);
    process.exit(1);
  }
}

run();
