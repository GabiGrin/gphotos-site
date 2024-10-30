import { MediaItem } from "./google-photos";
import { Database } from "./supabase";

export enum JobType {
  PROCESS_PAGE = "PROCESS_PAGE",
  UPLOAD_IMAGE = "UPLOAD_IMAGE",
  DELETE_IMAGE = "DELETE_IMAGE",
  PROCESS_SESSION = "PROCESS_SESSION",
}

export enum JobStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export interface BaseJobData {
  userId: string;
  parentJobId?: string;
  googleAccessToken: string;
}

export interface CreateProcessPageJobData extends BaseJobData {
  pageToken: string;
  pageSize: number;
}

export interface CreateImageUploadJobData extends BaseJobData {
  mediaItem: MediaItem;
}

export interface DeleteImageJobData {
  imagePath: string;
  thumbnailPath: string;
}

type DBJob = Database["public"]["Tables"]["jobs"]["Row"];

export type ProcessPageJob = DBJob & {
  type: JobType.PROCESS_PAGE;
  job_data: CreateProcessPageJobData;
};

export type ImageUploadJob = DBJob & {
  type: JobType.UPLOAD_IMAGE;
  job_data: CreateImageUploadJobData;
};

export type DeleteImageJob = DBJob & {
  type: JobType.DELETE_IMAGE;
  job_data: DeleteImageJobData;
};

export type Job = ProcessPageJob | ImageUploadJob | DeleteImageJob;

export type ProcessedImage =
  Database["public"]["Tables"]["processed_images"]["Row"];

export type Photo = ProcessedImage & {
  imageUrl: string;
  thumbnailUrl: string;
};

export type Site = Database["public"]["Tables"]["sites"]["Row"];

export interface LayoutConfig {
  buttons?: {
    share?: { show: boolean; value?: string };
    email?: { show: boolean; value: string };
    website?: { show: boolean; value: string };
  };
  content?: {
    title?: { show: boolean; value: string };
    description?: { show: boolean; value: string };
  };
  sort?: "newest" | "oldest";
  maxColumns?: 1 | 2 | 3;
}
