"use server";

import { createServerApi } from "@/utils/dal/server-api";
import { createClient } from "@/utils/supabase/server";

export async function deleteImages(imageIds: string[]) {
  try {
    const supabase = await createClient();
    const serverApi = createServerApi(supabase);
    await serverApi.deleteProcessedImages(imageIds);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete images:", error);
    return { success: false, error: "Failed to delete images" };
  }
}
