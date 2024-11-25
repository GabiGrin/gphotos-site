import { CreateImageUploadJobData, Job, JobType } from "@/types/myphotos";
import { Database } from "@/types/supabase";
import { createServerApi } from "@/utils/dal/server-api";
import { createServiceClient } from "@/utils/supabase/service";
import { NextRequest, NextResponse } from "next/server";
import logger from "@/utils/logger";
import { getGPhotosClient } from "@/utils/gphotos";
import { createThumbnail } from "@/utils/create-thumbnail";
import { processGPhotosImage } from "@/utils/process-gphotos-image";
import posthogServer from "@/utils/posthog";

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
  posthogServer.capture({
    distinctId: newJob.user_id,
    event: "job_started",
    properties: {
      jobId: newJob.id,
      jobType: newJob.type,
    },
  });

  const client = createServiceClient();
  const serverApi = createServerApi(client);

  function normalizeError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === "string") {
      return error;
    }
    if (error && typeof error === "object" && "toString" in error) {
      try {
        return JSON.stringify(error);
      } catch (e) {
        return error.toString();
      }
    }
    return "An unknown error occurred";
  }

  try {
    await serverApi.markJobAsProcessing(newJob.id);
    logger.debug({ jobId: newJob.id }, "Job marked as processing");

    const gphotos = getGPhotosClient();

    switch (newJob.type) {
      case JobType.PROCESS_PAGE: {
        logger.info({ jobId: newJob.id }, "Processing PROCESS_PAGE job");

        const pageSize = Math.min(
          newJob.job_data.pageSize,
          newJob.job_data.maxPhotosLimit
        );

        const items = await gphotos.listMediaItems({
          sessionId: newJob.session_id,
          googleAccessToken: newJob.job_data.googleAccessToken,
          pageSize,
          pageToken: newJob.job_data.pageToken,
        });

        const photoItems = items.mediaItems.filter(
          (item) => item.type === "PHOTO"
        );

        logger.info(
          {
            jobId: newJob.id,
            totalItems: items.mediaItems.length,
            photoItems: photoItems.length,
          },
          "Processed page"
        );

        await serverApi.incrementTotalImages(
          newJob.session_id,
          photoItems.length
        );

        const remainingPhotosAllowed =
          newJob.job_data.maxPhotosLimit - photoItems.length;

        if (remainingPhotosAllowed < 0) {
          logger.warn(
            { jobId: newJob.id, remainingPhotosAllowed },
            "Remaining photos allowed is negative"
          );
        }

        if (items.nextPageToken && remainingPhotosAllowed > 0) {
          const newPageSize = Math.min(
            remainingPhotosAllowed,
            newJob.job_data.pageSize
          );

          logger.info(
            {
              jobId: newJob.id,
              nextPageToken: items.nextPageToken,
              newPageSize,
            },
            "Creating next page job"
          );
          const nextJob = await serverApi.createProcessPageJob({
            parentJobId: newJob.id,
            pageToken: items.nextPageToken,
            pageSize: newPageSize,
            sessionId: newJob.session_id,
            googleAccessToken: newJob.job_data.googleAccessToken,
            userId: newJob.user_id,
            maxPhotosLimit: remainingPhotosAllowed,
          });
          logger.info(
            { jobId: newJob.id, nextJobId: nextJob.id },
            "Next page job created"
          );
        } else {
          await serverApi.updateSessionStatus(newJob.session_id, "uploading");
        }

        for (const item of photoItems) {
          logger.info(
            { jobId: newJob.id, itemId: item.id },
            "Creating image upload job"
          );
          try {
            await serverApi.createImageUploadJob({
              parentJobId: newJob.id,
              mediaItem: item,
              googleAccessToken: newJob.job_data.googleAccessToken,
              userId: newJob.user_id,
              sessionId: newJob.session_id,
            });
            logger.info(
              { jobId: newJob.id, itemId: item.id },
              "Image upload job created"
            );
          } catch (error) {
            logger.error(
              { jobId: newJob.id, itemId: item.id, error: error },
              "Error creating image upload job"
            );
          }
          logger.info({ jobId: newJob.id }, "Marking job as completed");
          await serverApi.markJobAsCompleted(newJob.id);
          logger.info({ jobId: newJob.id }, "Job marked as completed");

          posthogServer.capture({
            distinctId: newJob.user_id,
            event: "process_page_completed",
            properties: {
              jobId: newJob.id,
              itemsCount: photoItems.length,
              hasNextPage: !!items.nextPageToken,
            },
          });
        }
        break;
      }
      case JobType.UPLOAD_IMAGE: {
        const { mediaItem, googleAccessToken } = newJob.job_data;
        try {
          await processGPhotosImage({
            userId: newJob.user_id,
            sessionId: newJob.session_id,
            mediaItem,
            googleAccessToken,
            thumbnailWidth: 400,
          });

          await serverApi.incrementCompletedImages(newJob.session_id, 1);

          logger.info(
            { jobId: newJob.id, mediaItemId: mediaItem.id },
            "Image processed and added to database"
          );
        } catch (error) {
          await serverApi.incrementFailedImages(newJob.session_id, 1);
          logger.error(
            { jobId: newJob.id, mediaItemId: mediaItem.id, error: error },
            "Error processing image upload"
          );
          throw error;
        }

        posthogServer.capture({
          distinctId: newJob.user_id,
          event: "image_upload_completed",
          properties: {
            jobId: newJob.id,
            mediaItemId: mediaItem.id,
          },
        });

        break;
      }
      case JobType.DELETE_IMAGE: {
        const { thumbnailPath, imagePath } = newJob.job_data;

        logger.info(
          { jobId: newJob.id, imagePath, thumbnailPath },
          "Processing DELETE_IMAGE job"
        );

        try {
          const promises = [
            client.storage.from("images").remove([imagePath]),
            client.storage.from("thumbnails").remove([thumbnailPath]),
          ];

          const results = await Promise.all(promises);

          // Check for errors
          const errors = results
            .map((res, index) =>
              res.error ? `File ${index}: ${res.error.message}` : null
            )
            .filter(Boolean);

          if (errors.length > 0) {
            throw new Error(
              `Failed to delete some files: ${errors.join(", ")}`
            );
          }

          logger.info(
            { jobId: newJob.id, imagePath, thumbnailPath },
            "Successfully deleted image"
          );

          posthogServer.capture({
            distinctId: newJob.user_id,
            event: "image_deletion_completed",
            properties: {
              jobId: newJob.id,
              imagePath,
              thumbnailPath,
            },
          });
        } catch (error) {
          logger.error(
            { jobId: newJob.id, imagePath, thumbnailPath, error },
            "Error deleting image files"
          );
          throw error;
        }
        break;
      }
      default: {
        //@ts-expect-error
        throw new Error(`Invalid job type: ${newJob.type}`);
      }
    }

    await serverApi.markJobAsCompleted(newJob.id);
    logger.info({ jobId: newJob.id }, "Job processing completed");

    posthogServer.capture({
      distinctId: newJob.user_id,
      event: "job_completed",
      properties: {
        jobId: newJob.id,
        jobType: newJob.type,
      },
    });

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

    posthogServer.capture({
      distinctId: newJob.user_id,
      event: "job_failed",
      properties: {
        jobId: newJob.id,
        jobType: newJob.type,
        error: errorMessage,
      },
    });

    return NextResponse.json(
      { message: "Job processing failed" },
      { status: 200 }
    );
  }
}
