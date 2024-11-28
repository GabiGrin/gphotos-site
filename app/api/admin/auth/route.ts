import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const ADMIN_PASSWORD = "Roohama";
const COOKIE_NAME = "admin_auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { password } = body;

  if (password === ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false }, { status: 401 });
}
