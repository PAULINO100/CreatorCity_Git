import { NextResponse } from "next/server";
import { purchaseItem } from "@/lib/marketplace/store-engine";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    if (!body.itemId) return NextResponse.json({ error: "itemId is required" }, { status: 400 });

    const result = await purchaseItem(session.user.id, body.itemId);
    return NextResponse.json(result);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
