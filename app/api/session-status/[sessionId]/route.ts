import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createServerApi } from "@/utils/dal/server-api";

export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const client = await createClient();
  const { data: userData, error: authError } = await client.auth.getUser();

  if (authError || !userData.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = params;
  if (!sessionId) {
    return NextResponse.json(
      { message: "Session ID is required" },
      { status: 400 }
    );
  }

  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const serverApi = createServerApi(serviceClient);

  try {
    const status = await serverApi.getSessionJobsStatus(sessionId);
    return NextResponse.json(status, { status: 200 });
  } catch (error) {
    console.error("Error fetching session status:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
