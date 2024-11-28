import { createServerApi } from "@/utils/dal/server-api";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServiceClient } from "@/utils/supabase/service";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("admin_auth");

  if (!isAuthenticated) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const month = searchParams.get("month");

  if (!month) {
    return new NextResponse("Month parameter is required", { status: 400 });
  }

  const supabase = await createServiceClient();
  const api = createServerApi(supabase);

  try {
    const siteVisits = await api.getTopSiteVisits(month, 50);
    return NextResponse.json(siteVisits);
  } catch (error) {
    console.error("Error fetching site visits:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
