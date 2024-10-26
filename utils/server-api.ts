import {
  CreateProcessPageJobData,
  CreateImageUploadJobData,
  JobType,
  JobStatus,
} from "@/types/gphotos";
import { Database, Json } from "@/types/supabase";
import { SupabaseClient } from "@supabase/supabase-js";
import { MediaItem } from "@/types/google-photos";

export interface BaseJobDto {
  sessionId: string;
  googleAccessToken: string;
  userId: string;
}

export interface CreateProcessPageJobDto
  extends BaseJobDto,
    CreateProcessPageJobData {}

export interface CreateImageUploadJobDto
  extends BaseJobDto,
    CreateImageUploadJobData {}

export function createServerApi(client: SupabaseClient<Database>) {
  return {
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
      imagePublicUrl: string;
      thumbnailPublicUrl: string;
    }) => {
      const { data, error } = await client
        .from("processed_images")
        .insert({
          path: params.imagePath,
          user_id: params.userId,
          gphotos_id: params.mediaItem.id,
          raw_metadata: JSON.stringify(
            params.mediaItem.mediaFile.mediaFileMetadata
          ),
          width: params.mediaItem.mediaFile.mediaFileMetadata.width,
          height: params.mediaItem.mediaFile.mediaFileMetadata.height,
          public_url: params.imagePublicUrl,
          thumbnail_url: params.thumbnailPublicUrl,
        })
        .select();

      if (error) throw error;
      if (!data) throw new Error("No data returned from insert");

      return data[0];
    },
  };
}
