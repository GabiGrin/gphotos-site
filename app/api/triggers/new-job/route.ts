import { Job, JobType } from "@/types/gphotos";
import { Database } from "@/types/supabase";
import { createServerApi } from "@/utils/server-lib/server-api";
import { createServiceClient } from "@/utils/supabase/service";
import { NextRequest, NextResponse } from "next/server";
import logger from "@/utils/logger";

type InsertPayload<T> = {
  type: "INSERT";
  table: string;
  schema: string;
  record: T;
  old_record: null;
};

export async function POST(req: NextRequest) {
  const body = await req.json();

  const payload = body as InsertPayload<
    Database["public"]["Tables"]["jobs"]["Row"]
  >;

  const newJob = payload.record as Job;

  logger.info({ jobId: newJob.id, jobType: newJob.type }, "New job received");

  const client = createServiceClient();
  const serverApi = createServerApi(client);

  function normalizeError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return "An unknown error occurred";
  }

  try {
    await serverApi.markJobAsProcessing(newJob.id);
    logger.debug({ jobId: newJob.id }, "Job marked as processing");

    switch (newJob.type) {
      case JobType.PROCESS_PAGE: {
        logger.info({ jobId: newJob.id }, "Processing PROCESS_PAGE job");
        // Add your PROCESS_PAGE job logic here
        break;
      }
      case JobType.UPLOAD_IMAGE: {
        logger.info({ jobId: newJob.id }, "Processing UPLOAD_IMAGE job");
        // Add your UPLOAD_IMAGE job logic here
        break;
      }
      default: {
        throw new Error(`Invalid job type: ${newJob.type}`);
      }
    }

    await serverApi.markJobAsCompleted(newJob.id);
    logger.info({ jobId: newJob.id }, "Job processing completed");

    return NextResponse.json(
      { message: "Job processing completed" },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = normalizeError(error);
    await serverApi.markJobAsFailed(newJob.id, errorMessage);

    logger.error(
      { jobId: newJob.id, error: errorMessage },
      "Job processing failed"
    );

    return NextResponse.json(
      { message: "Job processing failed" },
      { status: 200 }
    );
  }
}
