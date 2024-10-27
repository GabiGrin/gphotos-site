import { ProcessedImage, Site } from "@/types/gphotos";
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
    getSiteByUserId: async (userId: string): Promise<Site> => {
      const { data, error } = await client
        .from("sites")
        .select()
        .eq("user_id", userId);
      if (error) throw error;
      return data[0] as Site;
    },
  };
}
