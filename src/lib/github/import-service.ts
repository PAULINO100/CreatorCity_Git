/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db/prisma";
import { GitHubRepository, ImportStats } from "./types";

// ─── Global Progress Store ───────────────────────────────────────────────────
// Used by the progress API endpoint to serve real-time status.
export const importProgress = {
  running: false,
  currentPage: 0,
  totalPages: 20,
  currentUser: 0,
  totalUsersTarget: 2000,
  usersCreated: 0,
  duplicatesSkipped: 0,
  errors: [] as string[],
  log: [] as string[],
  startedAt: null as Date | null,
  finishedAt: null as Date | null,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function logProgress(msg: string) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${msg}`;
  console.log(line);
  // Keep the last 500 log lines to avoid memory leak
  importProgress.log.push(line);
  if (importProgress.log.length > 500) importProgress.log.shift();
}

// ─── Main Service ─────────────────────────────────────────────────────────────
export class GitHubImportService {
  private token?: string;

  constructor(token?: string) {
    this.token = token || process.env.GITHUB_TOKEN;
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Atlas-City-Importer/2.0",
    };
    if (this.token) {
      headers["Authorization"] = `token ${this.token}`;
    }
    return headers;
  }

  // ── Fetch a single page of repositories with retry ──────────────────────────
  async fetchRepositoriesPage(
    minStars: number,
    page: number,
    perPage = 100,
    maxRetries = 3,
    maxStars?: number
  ): Promise<GitHubRepository[]> {
    const starQuery = maxStars ? `${minStars}..${maxStars}` : `>${minStars}`;
    const url = `https://api.github.com/search/repositories?q=stars:${starQuery}&sort=stars&order=desc&per_page=${perPage}&page=${page}`;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, { headers: this.getHeaders() });

        if (response.status === 429 || response.status === 403) {
          const retryAfter = response.headers.get("Retry-After") || "60";
          const waitMs = parseInt(retryAfter, 10) * 1000;
          logProgress(`⏳ Rate limited. Waiting ${retryAfter}s before retry ${attempt}/${maxRetries}...`);
          await sleep(waitMs);
          continue;
        }

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`GitHub API Error: ${response.status} - ${errorBody}`);
        }

        const data = await response.json();
        return data.items as GitHubRepository[];
      } catch (err: any) {
        if (attempt === maxRetries) throw err;
        logProgress(`⚠️  Attempt ${attempt} failed for page ${page}. Retrying in 5s...`);
        await sleep(5000);
      }
    }
    return [];
  }

  // ── Fetch user details to check quality filter (public_repos > 3) ────────────
  async fetchUserDetails(login: string, maxRetries = 3): Promise<{ public_repos: number } | null> {
    const url = `https://api.github.com/users/${login}`;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, { headers: this.getHeaders() });
        if (response.status === 429 || response.status === 403) {
          await sleep(10000);
          continue;
        }
        if (!response.ok) return null;
        return await response.json();
      } catch {
        if (attempt === maxRetries) return null;
        await sleep(2000);
      }
    }
    return null;
  }

  // ── Backwards-compatible single-batch import ──────────────────────────────────
  async importBatch(minStars = 5000, batchSize = 100): Promise<ImportStats> {
    const stats: ImportStats = {
      totalFetched: 0,
      usersCreated: 0,
      buildingsCreated: 0,
      duplicatesSkipped: 0,
      errors: [],
    };

    const repos = await this.fetchRepositoriesPage(minStars, 1, batchSize);
    stats.totalFetched = repos.length;

    for (const repo of repos) {
      try {
        const owner = repo.owner;
        const existing = await prisma.user.findUnique({ where: { github_id: String(owner.id) } });
        if (existing) { stats.duplicatesSkipped++; continue; }

        await prisma.user.create({
          data: {
            github_id: String(owner.id),
            name: owner.login,
            avatar_url: owner.avatar_url,
            dis_score: repo.stargazers_count,
            building: {
              create: {
                structure_type: this.getStructureType(repo.stargazers_count),
                height: Math.min(20 + Math.floor(repo.stargazers_count / 1000), 100),
                district_name: this.mapLanguageToDistrict(repo.language),
                position_x: Math.floor(Math.random() * 90) + 5,
                position_y: Math.floor(Math.random() * 90) + 5,
              },
            },
          },
        });
        stats.usersCreated++;
        stats.buildingsCreated++;
      } catch (err: any) {
        stats.errors.push(`Error importing repo ${repo.full_name}: ${err.message}`);
      }
    }
    return stats;
  }

  // ── MASSIVE IMPORT: up to 2000 users across 20 pages ─────────────────────────
  async importMassive(
    minStars = 500,
    totalPages = 10,
    batchPauseAfter = 200,
    batchPauseMs = 120000,
    maxStars?: number
  ): Promise<ImportStats> {
    const stats: ImportStats = {
      totalFetched: 0,
      usersCreated: 0,
      buildingsCreated: 0,
      duplicatesSkipped: 0,
      errors: [],
    };

    // Reset global progress
    Object.assign(importProgress, {
      running: true,
      currentPage: 0,
      totalPages,
      currentUser: 0,
      totalUsersTarget: totalPages * 100,
      usersCreated: 0,
      duplicatesSkipped: 0,
      errors: [],
      log: [],
      startedAt: new Date(),
      finishedAt: null,
    });

    logProgress(`🏙️  Starting MASSIVE import: ${totalPages} pages × 100 users (stars: ${maxStars ? minStars + '..' + maxStars : '>' + minStars})`);

    let usersProcessedInBatch = 0;

    for (let page = 1; page <= totalPages; page++) {
      importProgress.currentPage = page;
      logProgress(`📃 Fetching page ${page}/${totalPages}...`);

      let repos: GitHubRepository[];
      try {
        repos = await this.fetchRepositoriesPage(minStars, page, 100, 3, maxStars);
      } catch (err: any) {
        const errMsg = `Page ${page} fetch failed: ${err.message}`;
        logProgress(`❌ ${errMsg}`);
        stats.errors.push(errMsg);
        importProgress.errors.push(errMsg);
        continue;
      }

      stats.totalFetched += repos.length;
      logProgress(`   Found ${repos.length} repos on page ${page}.`);

      for (const repo of repos) {
        importProgress.currentUser++;
        usersProcessedInBatch++;

        const owner = repo.owner;
        const stars = repo.stargazers_count;

        try {
          // ── Duplicate check
          const existing = await prisma.user.findUnique({ where: { github_id: String(owner.id) } });
          if (existing) {
            stats.duplicatesSkipped++;
            importProgress.duplicatesSkipped++;
            continue;
          }

          // ── Quality filter: check public_repos > 3
          await sleep(100); // 100ms pause before every user details fetch
          const userDetails = await this.fetchUserDetails(owner.login);
          if (!userDetails || userDetails.public_repos <= 3) {
            logProgress(`   ⛔ Skipping ${owner.login} (quality filter: ${userDetails?.public_repos ?? 0} repos)`);
            stats.duplicatesSkipped++;
            importProgress.duplicatesSkipped++;
            continue;
          }

          // ── Create user + building
          const user = await prisma.user.create({
            data: {
              github_id: String(owner.id),
              name: owner.login,
              avatar_url: owner.avatar_url,
              dis_score: stars,
              building: {
                create: {
                  structure_type: this.getStructureType(stars),
                  height: Math.min(20 + Math.floor(stars / 1000), 100),
                  district_name: this.mapLanguageToDistrict(repo.language),
                  position_x: Math.floor(Math.random() * 90) + 5,
                  position_y: Math.floor(Math.random() * 90) + 5,
                },
              },
            },
          });

          stats.usersCreated++;
          stats.buildingsCreated++;
          importProgress.usersCreated++;
          logProgress(`✅ [${importProgress.currentUser}/${importProgress.totalUsersTarget}] Created @${user.name} (${stars}★)`);

        } catch (err: any) {
          const errMsg = `@${owner.login}: ${err.message}`;
          stats.errors.push(errMsg);
          importProgress.errors.push(errMsg);
          logProgress(`⚠️  Error: ${errMsg}`);
        }

        // ── Batch pause every batchPauseAfter users
        if (usersProcessedInBatch > 0 && usersProcessedInBatch % batchPauseAfter === 0) {
          logProgress(`⏸️  Batch pause: ${stats.usersCreated} users imported so far. Resting ${batchPauseMs / 1000}s...`);
          await sleep(batchPauseMs);
          usersProcessedInBatch = 0;
        }
      }

      // ── 500ms pause between pages
      await sleep(500);
    }

    importProgress.running = false;
    importProgress.finishedAt = new Date();

    // ── Post-import validation
    const totalUsersInDb = await prisma.user.count();
    logProgress(`\n📊 IMPORT COMPLETE!`);
    logProgress(`   Users Created: ${stats.usersCreated}`);
    logProgress(`   Duplicates Skipped: ${stats.duplicatesSkipped}`);
    logProgress(`   Errors: ${stats.errors.length}`);
    logProgress(`   Total Users in DB: ${totalUsersInDb}`);
    logProgress(totalUsersInDb >= 1000 ? `   ✅ 1000+ users reached!` : `   ⚠️  DB has ${totalUsersInDb} users (target: 1000)`);

    return stats;
  }

  private getStructureType(stars: number): string {
    if (stars > 50000) return "skyscraper";
    if (stars > 10000) return "tower";
    if (stars > 2000) return "studio";
    return "residential";
  }

  private mapLanguageToDistrict(language: string): string {
    const lang = (language || "").toLowerCase();
    if (["typescript", "javascript", "python", "rust", "go", "kotlin", "swift"].includes(lang)) return "tech";
    if (["css", "html", "design", "vue", "sass"].includes(lang)) return "creator";
    if (["c", "c++", "assembly", "r", "julia", "matlab"].includes(lang)) return "science";
    if (["java", "csharp", "c#", "php"].includes(lang)) return "education";
    return "startup";
  }
}
