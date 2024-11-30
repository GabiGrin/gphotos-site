import { Album, Photo, ProcessedImage, Site } from "@/types/myphotos";
import { Database } from "@/types/supabase";
import { SupabaseClient } from "@supabase/supabase-js";
import { JobStatusCounts } from "./server-api";
import { processedImageToPhoto } from "./api-utils";

export function createClientApi(client: SupabaseClient<Database>) {
  return {
    getProcessedImages: async (userId: string): Promise<Photo[]> => {
      const { data, error } = await client
        .from("processed_images")
        .select()
        .order("gphotos_created_at", { ascending: false })
        .eq("user_id", userId);
      if (error) throw error;
      return data.map((image) => processedImageToPhoto(client, image));
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

    createAlbum: async (
      album: Omit<Album, "id" | "created_at" | "updated_at" | "coverPhoto">
    ) => {
      const response = await client.from("albums").insert(album).select();
      if (response.error) throw response.error;
      return response.data[0];
    },

    getAlbums: async (userId: string): Promise<Album[]> => {
      const { data, error } = await client
        .from("albums")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching albums:", error);
        throw error;
      }

      return data as Album[];
    },

    updateAlbum: async (albumId: string, updates: Partial<Album>) => {
      const { data, error } = await client
        .from("albums")
        .update(updates)
        .eq("id", albumId)
        .select();

      if (error) throw error;
      return data[0];
    },

    deleteAlbum: async (albumId: string) => {
      const { error } = await client.from("albums").delete().eq("id", albumId);

      if (error) throw error;
    },

    async assignPhotosToAlbum(photoIds: string[], albumId: string) {
      const { error } = await client
        .from("processed_images")
        .update({ album_id: albumId })
        .in("id", photoIds);
      if (error) throw error;
    },

    subscribeToUploadSession: (
      sessionId: string,
      callback: (
        status: Database["public"]["Tables"]["upload_session_status"]["Row"]
      ) => void
    ) => {
      return client
        .channel(`upload_session_${sessionId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "upload_session_status",
            filter: `session_id=eq.${sessionId}`,
          },
          (payload) => {
            callback(
              payload.new as Database["public"]["Tables"]["upload_session_status"]["Row"]
            );
          }
        )
        .subscribe();
    },

    getMonthlyVisits: async (
      username: string,
      month: string
    ): Promise<number> => {
      const formattedMonth = month.slice(0, 7);

      const { data, error } = await client
        .from("site_visits")
        .select("visit_count")
        .eq("username", username)
        .like("visit_date", `${formattedMonth}%`);

      if (error) {
        console.error("Error fetching monthly visits:", error);
        return 0;
      }

      return data?.reduce((sum, row) => sum + (row.visit_count || 0), 0) || 0;
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
