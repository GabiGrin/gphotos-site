import { cookies } from "next/headers";
import CreateSiteForm from "./CreateSiteForm";
import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";
import posthogServer from "@/utils/posthog";

export default async function CreatePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const suggestedUsername =
    user?.user_metadata?.full_name || user?.email?.split("@")[0];

  async function createSite(prevState: any, username: string) {
    "use server";

    if (!username) {
      return { error: "Username is required" };
    }

    if (!user) {
      return { error: "User not found" };
    }

    const supabase = await createServiceClient();

    try {
      const { data, error } = await supabase
        .from("sites")
        .insert({ username, user_id: user.id, layout_config: {} })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          return {
            error: "This username is already taken. Please choose another one.",
          };
        }
        throw error;
      }

      posthogServer.capture({
        event: "site_created",
        distinctId: user.id,
        properties: {
          username,
        },
      });
      return { success: true, message: "Site created successfully!" };
    } catch (error) {
      console.error("Error creating site:", error);
      return {
        error: "An error occurred while creating the site. Please try again.",
      };
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-5">Create Your Site</h1>
      <CreateSiteForm
        suggestedUsername={suggestedUsername}
        createSite={createSite}
      />
    </div>
  );
}
