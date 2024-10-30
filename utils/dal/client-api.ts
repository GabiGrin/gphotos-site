import { Photo, ProcessedImage, Site } from "@/types/gphotos";
import { Database } from "@/types/supabase";
import { SupabaseClient } from "@supabase/supabase-js";

export function createClientApi(client: SupabaseClient<Database>) {
  return {
    getProcessedImages: async (userId: string): Promise<Photo[]> => {
      const { data, error } = await client
        .from("processed_images")
        .select()
        .eq("user_id", userId);
      if (error) throw error;
      return data.map((image) => ({
        ...image,
        imageUrl: client.storage.from("images").getPublicUrl(image.image_path)
          .data.publicUrl,
        thumbnailUrl: client.storage
          .from("thumbnails")
          .getPublicUrl(image.image_thumbnail_path).data.publicUrl,
      }));
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
