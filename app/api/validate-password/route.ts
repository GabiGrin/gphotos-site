import { createServerApi } from "@/utils/dal/server-api";
import { createServiceClient } from "@/utils/supabase/service";
import { NextRequest, NextResponse } from "next/server";
import { LayoutConfig } from "@/types/myphotos";

export async function POST(req: NextRequest) {
  try {
    const { domain, password } = await req.json();

    if (!domain || !password) {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    console.log("4242 domain", domain);

    const supabase = await createServiceClient();
    const serverApi = createServerApi(supabase);
    let host = domain
      ?.replace(
        ".local-myphotos.site:3000",
        `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
      )
      .replace(".myphotos.site", "");

    const site = await serverApi.getSiteByUsername(host);
    if (!site) {
      return NextResponse.json({ valid: false }, { status: 404 });
    }

    const layoutConfig = site.layout_config as LayoutConfig;
    const sitePassword = layoutConfig.security?.password?.value;

    if (!sitePassword) {
      return NextResponse.json({ valid: true });
    }

    const isValid = sitePassword === password;
    return NextResponse.json({ valid: isValid });
  } catch (error) {
    console.error("Password validation error:", error);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
