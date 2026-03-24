/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { GitHubImportService } from "@/lib/github/import-service";

export async function POST(request: Request) {
  // 1. Auth Check (Basic session check for demo)
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { token, minStars = 5000, batchSize = 100 } = body;

    // 2. Initialize Service
    const importService = new GitHubImportService(token);

    // 3. Run Import
    console.log(`🚀 [API] Starting GitHub import batch: stars > ${minStars}, size: ${batchSize}`);
    const stats = await importService.importBatch(minStars, batchSize);

    return NextResponse.json({
      message: "Import sequence completed",
      stats
    });

  } catch (error: any) {
    console.error("❌ [API] GitHub Import Error:", error);
    return NextResponse.json({
      error: "Internal Server Error",
      details: error.message
    }, { status: 500 });
  }
}
