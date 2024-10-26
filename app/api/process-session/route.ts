import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createServerApi } from "@/utils/server-api";
import { getGPhotosClient } from "@/utils/gphotos";
import { processImage } from "@/utils/process-image";

export async function POST(req: NextRequest) {
  const client = await createClient();
  const { data, error } = await client.auth.getUser();
  if (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }

  if (!data.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const sessionId = body.sessionId;
  const session = await client.auth.getSession();

  const googleAccessToken = session.data.session?.provider_token;

  if (!googleAccessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const serverApi = createServerApi(serviceClient);

  try {
    const job = await serverApi.createProcessPageJob({
      userId: data.user.id,
      sessionId,
      googleAccessToken,
      pageToken: "",
      pageSize: 10,
    });

    return NextResponse.json({ jobId: job.id }, { status: 200 });
  } catch (error) {
    console.error("error creating process page job", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
