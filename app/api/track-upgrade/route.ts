import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const client = await createClient();
  const { data: userData } = await client.auth.getUser();

  if (!userData.user) {
    return NextResponse.redirect("https://www.myphotos.site/upgrade");
  }

  try {
    await fetch(
      "https://app.getflowcode.io/api/apps/477deaf4-1dab-42b1-9a2a-9186c4afba97/mps-new-upgrade",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userData.user.id,
          email: userData.user.email,
          timestamp: new Date().toISOString(),
        }),
      }
    );
  } catch (error) {
    console.error("Failed to track upgrade attempt:", error);
  }

  return NextResponse.redirect("https://www.myphotos.site/upgrade");
}
