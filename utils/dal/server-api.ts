import {
  CreateProcessPageJobData,
  CreateImageUploadJobData,
  JobType,
  JobStatus,
  ProcessedImage,
  Site,
  DeleteImageJobData,
  Album,
  Photo,
} from "@/types/gphotos";
import { Database, Json } from "@/types/supabase";
import { SupabaseClient } from "@supabase/supabase-js";
import { MediaItem } from "@/types/google-photos";
import { logger } from "../logger";
import { NormalizeError } from "next/dist/shared/lib/utils";
import { processedImageToPhoto } from "./api-utils";

export interface BaseUploadJobDto {
  sessionId: string;
  googleAccessToken: string;
  userId: string;
}

export interface CreateProcessPageJobDto
  extends BaseUploadJobDto,
    CreateProcessPageJobData {}

export interface CreateImageUploadJobDto
  extends BaseUploadJobDto,
    CreateImageUploadJobData {}

export interface CreateDeleteImageJobDto extends DeleteImageJobData {
  userId: string;
}

export interface JobStatusCounts {
  processPageJobs: {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    total: number;
  };
  imageUploadJobs: {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    total: number;
  };
}

export function createServerApi(client: SupabaseClient<Database>) {
  const api = {
    createProcessPageJob: async (data: CreateProcessPageJobDto) => {
      const res = await client
        .from("jobs")
        .insert({
          type: JobType.PROCESS_PAGE,
          session_id: data.sessionId,
          job_data: {
            googleAccessToken: data.googleAccessToken,
            pageToken: data.pageToken,
            pageSize: data.pageSize,
          },
          user_id: data.userId,
        })
        .select();
      if (res.error) {
        throw new Error(res.error.message);
      }
      if (!res.data) {
        throw new Error("No data returned from insert");
      }
      return res.data[0];
    },
    createImageUploadJob: async (data: CreateImageUploadJobDto) => {
      const res = await client
        .from("jobs")
        .insert({
          type: JobType.UPLOAD_IMAGE,
          session_id: data.sessionId,
          job_data: {
            mediaItem: data.mediaItem as unknown as Json,
            googleAccessToken: data.googleAccessToken,
          },
          user_id: data.userId,
        })
        .select();
      if (res.error) {
        throw new Error(res.error.message);
      }
      if (!res.data) {
        throw new Error("No data returned from insert");
      }
      return res.data[0];
    },
    createDeleteImageJobs: async (data: CreateDeleteImageJobDto[]) => {
      const res = await client
        .from("jobs")
        .insert(
          data.map((job) => ({
            type: JobType.DELETE_IMAGE,
            session_id: "n/a",
            job_data: {
              imagePath: job.imagePath,
              thumbnailPath: job.thumbnailPath,
            },
            user_id: job.userId,
          }))
        )
        .select();
      if (res.error) {
        throw new Error(res.error.message);
      }
      if (!res.data) {
        throw new Error("No data returned from insert");
      }
      return res.data[0];
    },
    markJobAsProcessing: async (jobId: string) => {
      const res = await client
        .from("jobs")
        .update({
          status: JobStatus.PROCESSING,
          updated_at: new Date().toISOString(),
        })
        .eq("id", jobId);

      if (res.error) {
        throw new Error(res.error.message);
      }
    },
    markJobAsCompleted: async (jobId: string) => {
      const res = await client
        .from("jobs")
        .update({
          status: JobStatus.COMPLETED,
          updated_at: new Date().toISOString(),
        })
        .eq("id", jobId);

      if (res.error) {
        throw new Error(res.error.message);
      }
    },
    markJobAsFailed: async (jobId: string, errorMessage: string) => {
      const res = await client
        .from("jobs")
        .update({
          status: JobStatus.FAILED,
          updated_at: new Date().toISOString(),
          last_error: errorMessage,
        })
        .eq("id", jobId);
      if (res.error) {
        throw new Error(res.error.message);
      }
    },
    saveProcessedImage: async (params: {
      userId: string;
      mediaItem: MediaItem;
      imagePath: string;
      thumbnailPath: string;
    }): Promise<ProcessedImage> => {
      const { data, error } = await client
        .from("processed_images")
        .insert({
          user_id: params.userId,
          imported_at: new Date().toISOString(),
          gphotos_created_at: params.mediaItem.createTime,
          gphotos_id: params.mediaItem.id,
          raw_metadata: JSON.stringify(
            params.mediaItem.mediaFile.mediaFileMetadata
          ),
          width: params.mediaItem.mediaFile.mediaFileMetadata.width,
          height: params.mediaItem.mediaFile.mediaFileMetadata.height,
          image_path: params.imagePath,
          image_thumbnail_path: params.thumbnailPath,
        })
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error("No data returned from insert");
      }

      return data[0] as ProcessedImage;
    },
    getProcessedImages: async (userId: string): Promise<ProcessedImage[]> => {
      const { data, error } = await client
        .from("processed_images")
        .select()
        .eq("user_id", userId);
      if (error) throw error;
      return data;
    },
    getSiteByUsername: async (username: string): Promise<Site> => {
      const { data, error } = await client
        .from("sites")
        .select()
        .eq("username", username);
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error("No data returned from select");
      }
      return data[0] as Site;
    },
    getSiteByUserId: async (userId: string): Promise<Site> => {
      const { data, error } = await client
        .from("sites")
        .select()
        .eq("user_id", userId);
      if (error) throw error;
      return data[0] as Site;
    },
    createUserSite: async (site: Site) => {
      const { data, error } = await client.from("sites").insert(site);
      if (error) throw error;
    },
    updateUserSite: async (site: Site) => {
      const { data, error } = await client
        .from("sites")
        .update(site)
        .eq("user_id", site.user_id);
      if (error) throw error;
    },
    createSite: async (params: {
      userId: string;
      username: string;
      siteName: string;
    }): Promise<Site> => {
      const { data, error } = await client
        .from("sites")
        .insert({
          user_id: params.userId,
          username: params.username,
          layout_config: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error("No data returned from insert");
      }

      return data[0] as Site;
    },
    deleteProcessedImages: async (dto: {
      userId: string;
      imageIds: string[];
    }): Promise<void> => {
      logger.info(
        {
          userId: dto.userId,
          imageIds: dto.imageIds,
        },
        `Starting deletion of ${dto.imageIds.length} images`
      );

      try {
        // First get the images to be deleted
        const { data: images, error: fetchError } = await client
          .from("processed_images")
          .select()
          .in("id", dto.imageIds)
          .eq("user_id", dto.userId); // Add user check for security

        if (fetchError) {
          logger.error(
            {
              error: fetchError,
              userId: dto.userId,
              imageIds: dto.imageIds,
            },
            "Failed to fetch images for deletion"
          );
          throw new Error("Failed to fetch images for deletion", fetchError);
        }

        if (!images || images.length === 0) {
          logger.warn(
            {
              error: fetchError,
              userId: dto.userId,
              imageIds: dto.imageIds,
            },
            "No images found for deletion"
          );
          return; // Early return if no images found
        }

        // Log if not all requested images were found
        if (images.length !== dto.imageIds.length) {
          logger.warn(
            {
              userId: dto.userId,
              requestedCount: dto.imageIds.length,
              foundCount: images.length,
            },
            "Some requested images were not found"
          );
        }

        // Process images in batches of 20
        const BATCH_SIZE = 20;
        const imageFiles = images.map((image) => ({
          imagePath: image.image_path,
          thumbnailPath: image.image_thumbnail_path,
        }));

        // Split into batches
        for (let i = 0; i < imageFiles.length; i += BATCH_SIZE) {
          const batch = imageFiles.slice(i, i + BATCH_SIZE);
          logger.debug(
            {
              batchSize: batch.length,
            },
            `Processing deletion batch ${i / BATCH_SIZE + 1}`
          );

          try {
            await api.createDeleteImageJobs(
              batch.map((file) => ({
                userId: dto.userId,
                ...file,
              }))
            );
          } catch (error) {
            console.error(error);
            logger.error(
              {
                batchIndex: i / BATCH_SIZE,
                userId: dto.userId,
              },
              "Failed to create delete jobs"
            );
            throw new Error("Failed to create delete jobs");
          }
        }

        // Delete the database records
        const { error } = await client
          .from("processed_images")
          .delete()
          .in("id", dto.imageIds)
          .eq("user_id", dto.userId); // Add user check for security

        if (error) {
          logger.error(
            {
              error,
              userId: dto.userId,
              imageIds: dto.imageIds,
            },
            "Failed to delete image records"
          );
          throw new Error("Failed to delete image records");
        }

        logger.info(
          {
            userId: dto.userId,
          },
          "Successfully deleted images"
        );
      } catch (error) {
        logger.error({
          error,
          userId: dto.userId,
          imageIds: dto.imageIds,
        });
        throw error;
      }
    },
    getSessionJobsStatus: async (
      sessionId: string
    ): Promise<JobStatusCounts> => {
      const [processPageResults, imageUploadResults] = await Promise.all([
        client
          .from("jobs")
          .select()
          .eq("session_id", sessionId)
          .eq("type", JobType.PROCESS_PAGE),

        client
          .from("jobs")
          .select()
          .eq("session_id", sessionId)
          .eq("type", JobType.UPLOAD_IMAGE),
      ]);

      if (processPageResults.error) throw processPageResults.error;
      if (imageUploadResults.error) throw imageUploadResults.error;

      return {
        processPageJobs: {
          pending: processPageResults.data.filter(
            (job) => job.status === JobStatus.PENDING
          ).length,
          processing: processPageResults.data.filter(
            (job) => job.status === JobStatus.PROCESSING
          ).length,
          completed: processPageResults.data.filter(
            (job) => job.status === JobStatus.COMPLETED
          ).length,
          failed: processPageResults.data.filter(
            (job) => job.status === JobStatus.FAILED
          ).length,
          total: processPageResults.data.length,
        },
        imageUploadJobs: {
          pending: imageUploadResults.data.filter(
            (job) => job.status === JobStatus.PENDING
          ).length,
          processing: imageUploadResults.data.filter(
            (job) => job.status === JobStatus.PROCESSING
          ).length,
          completed: imageUploadResults.data.filter(
            (job) => job.status === JobStatus.COMPLETED
          ).length,
          failed: imageUploadResults.data.filter(
            (job) => job.status === JobStatus.FAILED
          ).length,
          total: imageUploadResults.data.length,
        },
      };
    },
    updateSiteLayout: async (params: {
      userId: string;
      layoutConfig: Json;
    }): Promise<void> => {
      // First verify the user owns the site
      const { data: site, error: siteError } = await client
        .from("sites")
        .select()
        .eq("user_id", params.userId)
        .single();

      if (siteError) {
        logger.error(
          { error: siteError, userId: params.userId },
          "Failed to fetch site for layout update"
        );
        throw new Error("Failed to fetch site");
      }

      if (!site) {
        throw new Error("Site not found");
      }

      // Update the layout config
      const { error } = await client
        .from("sites")
        .update({
          layout_config: params.layoutConfig,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", params.userId);

      if (error) {
        logger.error(
          { error, userId: params.userId },
          "Failed to update site layout"
        );
        throw new Error("Failed to update site layout");
      }
    },
    getAlbumsByUserId: async (userId: string): Promise<Album[]> => {
      const { data, error } = await client
        .from("albums")
        .select()
        .eq("user_id", userId);

      if (error) throw error;
      return data;
    },
    getImageByIds: async (imageIds: string[]): Promise<Photo[]> => {
      const { data, error } = await client
        .from("processed_images")
        .select()
        .in("id", imageIds);

      if (error) throw error;
      return data.map((image) => processedImageToPhoto(client, image));
    },
    getAlbumById: async (albumId: string): Promise<Album> => {
      const { data, error } = await client
        .from("albums")
        .select()
        .eq("id", albumId);
      if (error) throw error;
      return data[0];
    },
  };

  return api;
}
