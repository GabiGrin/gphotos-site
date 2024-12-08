import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";
import { createServerApi } from "@/utils/dal/server-api";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const client = await createClient();
  const { data: userData } = await client.auth.getUser();

  if (!userData.user) {
    return NextResponse.redirect("https://app.myphotos.site/upgrade-cs");
  }

  const plan = req.nextUrl.searchParams.get("plan") as "basic" | "pro";

  try {
    const serviceClient = createServiceClient();
    const serverApi = createServerApi(serviceClient);

    await serverApi.upgradeUserPlan(userData.user.id, plan);

    // Get the user's site info
    const site = await serverApi
      .getSiteByUserId(userData.user.id)
      .catch(() => null);

    await fetch(
      "https://app.getflowcode.io/api/apps/477deaf4-1dab-42b1-9a2a-9186c4afba97/mps-new-upgrade-step-2",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userData.user.id,
          email: userData.user.email,
          timestamp: new Date().toISOString(),
          plan: plan,
          username: site?.username ?? "n/a",
        }),
      }
    );

    return NextResponse.redirect("https://app.myphotos.site/upgrade-success");
  } catch (error) {
    console.error("Failed to process upgrade:", error);
    return NextResponse.redirect("https://app.myphotos.site/upgrade-cs");
  }
}
