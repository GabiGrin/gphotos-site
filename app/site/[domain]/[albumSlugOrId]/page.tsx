import { createServiceClient } from "@/utils/supabase/service";
import { createServerApi } from "@/utils/dal/server-api";
import logger from "@/utils/logger";
import NotFound from "../not-found";
import { LayoutConfig, Photo } from "@/types/myphotos";
import { Metadata } from "next";
import UserSite from "@/app/components/UserSite";
import { processedImageToPhoto } from "@/utils/dal/api-utils";
import { getLimits } from "@/premium/plans";

async function getAlbum(
  serverApi: any,
  albumSlugOrId: string,
  userId?: string
) {
  let album = userId
    ? await serverApi.getAlbumBySlug(albumSlugOrId, userId).catch((e: any) => {
        logger.error(e, "getAlbumBySlug error");
        return null;
      })
    : null;

  if (!album) {
    album = await serverApi.getAlbumById(albumSlugOrId).catch((e: any) => {
      logger.error(e, "getAlbumById error");
      return null;
    });
  }

  return album;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string; albumSlugOrId: string }>;
}): Promise<Metadata> {
  const { domain, albumSlugOrId } = await params;
  const supabase = await createServiceClient();
  const serverApi = createServerApi(supabase);
  const host = domain.replace(".myphotos.site", "");

  const site = await serverApi.getSiteByUsername(host).catch((e) => {
    logger.error(e, "generateMetadata getSiteByUsername error");
    return null;
  });

  const album = await getAlbum(serverApi, albumSlugOrId, site?.user_id);

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
  const host = domain.replace(".myphotos.site", "");

  const site = await serverApi.getSiteByUsername(host).catch((e) => {
    logger.error(e, "AlbumPage getSiteByUsername error");
    return null;
  });

  if (!site) {
    return <NotFound domain={domain} />;
  }

  const album = await getAlbum(serverApi, albumSlugOrId, site.user_id);

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
