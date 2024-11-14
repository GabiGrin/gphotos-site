import { createServiceClient } from "@/utils/supabase/service";
import { createServerApi } from "@/utils/dal/server-api";
import logger from "@/utils/logger";
import NotFound from "../not-found";
import { LayoutConfig, Photo } from "@/types/gphotos";
import { Metadata } from "next";
import UserSite from "@/app/components/UserSite";
import { processedImageToPhoto } from "@/utils/dal/api-utils";
import { getLimits } from "@/premium/plans";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string; albumSlugOrId: string }>;
}): Promise<Metadata> {
  const { domain, albumSlugOrId } = await params;
  const supabase = await createServiceClient();
  const serverApi = createServerApi(supabase);
  const host = domain.replace(".gphotos.site", "");

  const site = await serverApi.getSiteByUsername(host).catch((e) => {
    logger.error(e, "generateMetadata getSiteByUsername error");
    return null;
  });

  if (!site) {
    return { title: "Not Found" };
  }

  const album = await serverApi.getAlbumById(albumSlugOrId).catch((e) => {
    logger.error(e, "generateMetadata getAlbumById error");
    return null;
  });

  return {
    title: album?.title || "Album Not Found",
  };
}

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ domain: string; albumSlugOrId: string }>;
}) {
  const { domain, albumSlugOrId } = await params;
  const supabase = await createServiceClient();
  const serverApi = createServerApi(supabase);
  const host = domain.replace(".gphotos.site", "");

  const site = await serverApi.getSiteByUsername(host).catch((e) => {
    logger.error(e, "AlbumPage getSiteByUsername error");
    return null;
  });

  if (!site) {
    return <NotFound domain={domain} />;
  }

  // Try to get album by ID first, then by slug if ID lookup fails
  let album = await serverApi
    .getAlbumBySlug(albumSlugOrId, site.user_id)
    .catch((e) => {
      logger.error(e, "AlbumPage getAlbumBySlug error");
      return null;
    });

  if (!album) {
    album = await serverApi.getAlbumById(albumSlugOrId).catch((e) => {
      logger.error(e, "AlbumPage getAlbumById error");
      return null;
    });
  }

  if (!album) {
    return <NotFound domain={domain} />;
  }

  const limits = getLimits(site);

  const layoutConfig = site.layout_config as LayoutConfig;
  const sortOrder = layoutConfig.sort === "oldest" ? true : false; // true for ascending (oldest), false for descending (newest)

  const { data: images, error } = await supabase
    .from("processed_images")
    .select("*")
    .eq("album_id", album.id)
    .order("gphotos_created_at", { ascending: sortOrder });

  if (error) {
    logger.error(error, "AlbumPage getProcessedImages error");
    return <div>Error loading images. Please try again later.</div>;
  }

  const photos: Photo[] = images.map((image) =>
    processedImageToPhoto(supabase, image)
  );

  return (
    <UserSite
      layoutConfig={layoutConfig}
      images={photos}
      albums={[]}
      currentAlbum={album}
      showBranding={limits.branding}
      hostname={host}
    />
  );
}
