import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const ADMIN_PASSWORD = "Roohama";
const COOKIE_NAME = "admin_auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { password } = body;

  if (password === ADMIN_PASSWORD) {
    const cookieStore = await cookies();

    // Set cookie to expire in 7 days
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);

    cookieStore.set(COOKIE_NAME, "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      expires: expirationDate, // Add expiration date
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false }, { status: 401 });
}
