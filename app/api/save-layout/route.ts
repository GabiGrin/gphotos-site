import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/service";
import { createServerApi } from "@/utils/dal/server-api";
import { logger } from "@/utils/logger";

export async function POST(req: NextRequest) {
  const client = await createClient();

  // Verify user is authenticated
  const { data: userData, error: authError } = await client.auth.getUser();
  if (authError || !userData.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { layoutConfig } = body;

    if (!layoutConfig) {
      return NextResponse.json(
        { message: "Layout config is required" },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();

    const serverApi = createServerApi(serviceClient);

    await serverApi.updateSiteLayout({
      userId: userData.user.id,
      layoutConfig,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logger.error({ error }, "Failed to save layout configuration");
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
