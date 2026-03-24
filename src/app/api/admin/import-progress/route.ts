import { NextResponse } from "next/server";
import { importProgress } from "@/lib/github/import-service";

export async function GET() {
  const elapsed = importProgress.startedAt
    ? Math.floor((Date.now() - importProgress.startedAt.getTime()) / 1000)
    : 0;

  const percent = importProgress.totalUsersTarget > 0
    ? Math.round((importProgress.currentUser / importProgress.totalUsersTarget) * 100)
    : 0;

  const recentLog = importProgress.log.slice(-20);

  return NextResponse.json({
    running: importProgress.running,
    progress: {
      page: importProgress.currentPage,
      totalPages: importProgress.totalPages,
      processedUsers: importProgress.currentUser,
      totalUsersTarget: importProgress.totalUsersTarget,
      percent,
    },
    results: {
      usersCreated: importProgress.usersCreated,
      duplicatesSkipped: importProgress.duplicatesSkipped,
      errors: importProgress.errors.length,
    },
    timing: {
      startedAt: importProgress.startedAt,
      finishedAt: importProgress.finishedAt,
      elapsedSeconds: elapsed,
    },
    recentLog,
  });
}
