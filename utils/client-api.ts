import { ProcessedImage } from "@/types/gphotos";
import { Database } from "@/types/supabase";
import { SupabaseClient } from "@supabase/supabase-js";

export function createClientApi(client: SupabaseClient<Database>) {
  return {
    getProcessedImages: async (userId: string): Promise<ProcessedImage[]> => {
      const { data, error } = await client
        .from("processed_images")
        .select()
        .eq("user_id", userId);
      if (error) throw error;
      return data;
    },
  };
}
