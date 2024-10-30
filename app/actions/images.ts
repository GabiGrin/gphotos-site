"use server";

import { createServerApi } from "@/utils/dal/server-api";
import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";

export async function deleteImages(userId: string, imageIds: string[]) {
  "use server";
  try {
    const supabase = createServiceClient();
    const serverApi = createServerApi(supabase);
    await serverApi.deleteProcessedImages({
      userId: userId,
      imageIds: imageIds,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to delete images:", error);
    return { success: false, error: "Failed to delete images" };
  }
}
