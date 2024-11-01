import { Photo, ProcessedImage, Site } from "@/types/gphotos";
import { Database } from "@/types/supabase";
import { SupabaseClient } from "@supabase/supabase-js";
import { JobStatusCounts } from "./server-api";

export function createClientApi(client: SupabaseClient<Database>) {
  return {
    getProcessedImages: async (userId: string): Promise<Photo[]> => {
      const { data, error } = await client
        .from("processed_images")
        .select()
        .order("gphotos_created_at", { ascending: false })
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
      if (data.length === 0) {
        throw new Error("Site not found");
      }
      return data[0] as Site;
    },
    getSessionStatus: async (sessionId: string): Promise<JobStatusCounts> => {
      const response = await fetch(`/api/session-status/${sessionId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch session status");
      }

      return response.json();
    },
    saveLayoutConfig: async (layoutConfig: any) => {
      const response = await fetch("/api/save-layout", {
        method: "POST",
        body: JSON.stringify({ layoutConfig }),
      });

      if (!response.ok) {
        throw new Error("Failed to save layout configuration");
      }

      return response.json();
    },
  };
}

export async function processGPhotosSession(sessionId: string) {
  const response = await fetch("/api/process-session", {
    method: "POST",
    body: JSON.stringify({ sessionId }),
  });

  if (!response.ok) {
    throw new Error("Failed to process Google Photos session");
  }

  return response.json();
}
