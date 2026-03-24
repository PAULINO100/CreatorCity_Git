import { NextResponse } from "next/server";
import { listItems } from "@/lib/marketplace/store-engine";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const items = await listItems(category);
    return NextResponse.json({ items });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
