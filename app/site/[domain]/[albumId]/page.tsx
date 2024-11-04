import { createServiceClient } from "@/utils/supabase/service";
import { createServerApi } from "@/utils/dal/server-api";
import logger from "@/utils/logger";
import NotFound from "../not-found";
import { LayoutConfig, Photo } from "@/types/gphotos";
import { Metadata } from "next";
import UserSite from "@/app/components/UserSite";

export async function generateMetadata({
  params,
}: {
  params: { domain: string; albumId: string };
}): Promise<Metadata> {
  const { domain, albumId } = await params;
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

  const album = await serverApi.getAlbumById(albumId).catch((e) => {
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
  params: { domain: string; albumId: string };
}) {
  const { domain, albumId } = await params;
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

  const layoutConfig = site.layout_config as LayoutConfig;

  const album = await serverApi.getAlbumById(albumId).catch((e) => {
    logger.error(e, "AlbumPage getAlbumById error");
    return null;
  });

  if (!album) {
    return <NotFound domain={domain} />;
  }

  const { data: images, error } = await supabase
    .from("processed_images")
    .select("*")
    .eq("album_id", albumId)
    .order("gphotos_created_at", { ascending: false });

  if (error) {
    logger.error(error, "AlbumPage getProcessedImages error");
    return <div>Error loading images. Please try again later.</div>;
  }

  const photos: Photo[] = images.map((image) => ({
    imageUrl: supabase.storage.from("images").getPublicUrl(image.image_path)
      .data.publicUrl,
    thumbnailUrl: supabase.storage
      .from("thumbnails")
      .getPublicUrl(image.image_thumbnail_path).data.publicUrl,
    ...image,
  }));

  return (
    <UserSite
      layoutConfig={layoutConfig}
      images={photos}
      album={album}
      domain={domain}
    />
  );
}
