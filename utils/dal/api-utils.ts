import { Photo, ProcessedImage } from "@/types/myphotos";
import { Database } from "@/types/supabase";
import { SupabaseClient } from "@supabase/supabase-js";

export function processedImageToPhoto(
  supabase: SupabaseClient<Database>,
  image: ProcessedImage
): Photo {
  return {
    ...image,
    imageUrl: supabase.storage.from("images").getPublicUrl(image.image_path)
      .data.publicUrl,
    thumbnailUrl: supabase.storage
      .from("thumbnails")
      .getPublicUrl(image.image_thumbnail_path).data.publicUrl,
  };
}
