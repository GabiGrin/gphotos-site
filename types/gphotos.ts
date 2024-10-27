import { MediaItem } from "./google-photos";
import { Database } from "./supabase";

export enum JobType {
  PROCESS_PAGE = "PROCESS_PAGE",
  UPLOAD_IMAGE = "UPLOAD_IMAGE",
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

type DBJob = Database["public"]["Tables"]["jobs"]["Row"];

export type ProcessPageJob = DBJob & {
  type: JobType.PROCESS_PAGE;
  job_data: CreateProcessPageJobData;
};

export type ImageUploadJob = DBJob & {
  type: JobType.UPLOAD_IMAGE;
  job_data: CreateImageUploadJobData;
};

export type Job = ProcessPageJob | ImageUploadJob;

export type ProcessedImage =
  Database["public"]["Tables"]["processed_images"]["Row"];

export type Site = Database["public"]["Tables"]["sites"]["Row"];
