import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createServerApi } from "@/utils/dal/server-api";
import { getLimits } from "@/premium/plans";
import { JobStatus } from "@/types/myphotos";
import logger from "@/utils/logger";
import { MAX_MEDIA_ITEMS_PER_PAGE } from "@/utils/gphotos";

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

  const pendingJobsCount = await serverApi.getJobsCountByStatus(data.user.id, [
    JobStatus.PENDING,
    JobStatus.PROCESSING,
  ]);
  if (pendingJobsCount > 0) {
    return NextResponse.json(
      { message: "You have pending jobs. Please wait for them to complete." },
      { status: 429 }
    );
  }

  const site = await serverApi.getSite(data.user.id);
  const limits = getLimits(site);
  const currentPhotoCount = await serverApi.getPhotoCount(data.user.id);

  const maxPhotosLimit = limits.photoLimit - currentPhotoCount;

  const pageSize = Math.min(maxPhotosLimit, MAX_MEDIA_ITEMS_PER_PAGE);

  logger.info(
    { maxPhotosLimit, pageSize, currentPhotoCount },
    "Creating process page job with page size"
  );

  try {
    const status = await serverApi.createUploadSessionStatus({
      sessionId,
      userId: data.user.id,
      status: "scanning",
    });
    logger.info({ status }, "Created upload session status");
    const job = await serverApi.createProcessPageJob({
      userId: data.user.id,
      sessionId,
      googleAccessToken,
      pageToken: "",
      pageSize,
      maxPhotosLimit: maxPhotosLimit,
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

/*
Code to easily test the process-session endpoint:
// const photosClient = await getGPhotosClient();

  // const photos = await photosClient.listMediaItems({
  //   sessionId,
  //   pageSize: 10,
  //   googleAccessToken: googleAccessToken,
  // });

  // const first = photos.mediaItems[0];

  // const processedImage = await processGPhotosImage({
  //   thumbnailWidth: 300,
  //   userId: data.user.id,
  //   sessionId,
  //   mediaItem: first,
  //   googleAccessToken,
  // });

  // return NextResponse.json({ processedImage }, { status: 200 });
*/
