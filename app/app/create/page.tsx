import { cookies } from "next/headers";
import CreateSiteForm from "./CreateSiteForm";
import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";
import posthogServer from "@/utils/posthog";
import { LayoutConfig } from "@/types/gphotos";
import { Json } from "@/types/supabase";

function isValidUsername(username: string): { valid: boolean; error?: string } {
  // Check length
  if (username.length < 3) {
    return {
      valid: false,
      error: "Username must be at least 3 characters long",
    };
  }
  if (username.length > 30) {
    return { valid: false, error: "Username must be less than 30 characters" };
  }

  // Check for valid characters (letters, numbers, hyphens, underscores)
  const validUsernameRegex = /^[a-zA-Z0-9-_]+$/;
  if (!validUsernameRegex.test(username)) {
    return {
      valid: false,
      error:
        "Username can only contain letters, numbers, hyphens, and underscores",
    };
  }

  return { valid: true };
}

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

    const validation = isValidUsername(username);
    if (!validation.valid) {
      return { error: validation.error };
    }

    if (!user) {
      return { error: "User not found" };
    }

    username = username.toLowerCase();

    const supabase = await createServiceClient();

    try {
      const firstName =
        user.user_metadata.full_name?.split(" ")[0] ?? "Unknown";

      const layoutConfig: LayoutConfig = {
        content: {
          title: { show: true, value: `${firstName}'s Photos` },
          description: {
            show: true,
            value: `Welcome, my name is ${firstName} and I love taking pictures on my phone. Feel free to explore and reach out for more information.`,
          },
        },
        buttons: {
          email: { show: true, value: user.email ?? "" },
          website: { show: true, value: "https://www.gphotos.site" },
        },
      };
      const { data, error } = await supabase
        .from("sites")
        .insert({
          username,
          user_id: user.id,
          layout_config: layoutConfig as Json,
        })
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
