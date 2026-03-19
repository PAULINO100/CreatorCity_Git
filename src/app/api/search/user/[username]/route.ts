import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  const username = params.username;

  try {
    const user = await prisma.user.findFirst({
      where: {
        name: username
      },
      include: {
        building: true,
        badges: {
          include: {
            badge: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("User API Error:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}
