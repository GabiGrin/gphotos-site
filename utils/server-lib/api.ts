import { Database } from "@/types/supabase";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export enum JobType {
  PROCESS_PAGE = "PROCESS_PAGE",
  UPLOAD_IMAGE = "UPLOAD_IMAGE",
  PROCESS_SESSION = "PROCESS_SESSION",
}

export function createServerApi(client: SupabaseClient<Database>) {
  return {
    createJob: async (userId: string, type: JobType, jobData: any) => {
      await client.from("jobs").insert({
        type,
        job_data: jobData,
        user_id: userId,
      });
    },
  };
}
