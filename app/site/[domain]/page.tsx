import { createServiceClient } from "@/utils/supabase/service";
import MasonryGallery from "../../components/MasonryGallery";
import Link from "next/link";
import { createServerApi } from "@/utils/dal/server-api";
import logger from "@/utils/logger";
import NotFound from "./not-found";
import posthogServer from "@/utils/posthog";
import { LayoutConfig } from "@/types/gphotos";
import { Metadata } from "next";
import UserSite from "@/app/components/UserSite";

// Add this function to generate metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await params;
  const supabase = await createServiceClient();
  const serverApi = createServerApi(supabase);
  const host = domain.replace(".gphotos.site", "");

  const site = await serverApi.getSiteByUsername(host).catch((e) => {
    logger.error(e, "generateMetadata getSiteByUsername error");
    return null;
  });

  if (!site) {
    return {
      title: "Not Found",
    };
  }

  const layoutConfig = site.layout_config as LayoutConfig;

  return {
    title: layoutConfig.content?.title || "Photo Gallery",
  };
}

export default async function UserGallery({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const supabase = await createServiceClient();

  const serverApi = createServerApi(supabase);

  // Fetch processed images for the user from Supabase

  const host = domain.replace(".gphotos.site", "");

  logger.info({ host }, "UserGallery host");

  const site = await serverApi.getSiteByUsername(host).catch((e) => {
    logger.error(e, "UserGallery getSiteByUsername error");
    return null;
  });

  if (!site) {
    return <NotFound domain={domain} />;
  }

  const layoutConfig = site.layout_config as LayoutConfig;

  const { data: images, error } = await supabase
    .from("processed_images")
    .select("*")
    .eq("user_id", site.user_id)
    .order("gphotos_created_at", { ascending: false });

  if (error) {
    logger.error(error, "UserGallery getProcessedImages error");
    return <div>Error loading images. Please try again later.</div>;
  }

  posthogServer.capture({
    event: "view_site",
    distinctId: site.user_id,
    properties: {
      domain,
    },
  });

  return <UserSite layoutConfig={layoutConfig} images={images} />;
}
