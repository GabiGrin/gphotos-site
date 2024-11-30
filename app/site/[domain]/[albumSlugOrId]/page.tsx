import { createServiceClient } from "@/utils/supabase/service";
import { createServerApi } from "@/utils/dal/server-api";
import logger from "@/utils/logger";
import NotFound from "../not-found";
import { LayoutConfig, Photo } from "@/types/myphotos";
import { Metadata } from "next";
import UserSite from "@/app/components/UserSite";
import { processedImageToPhoto } from "@/utils/dal/api-utils";
import { getLimits } from "@/premium/plans";
import { SupabaseClient } from "@supabase/supabase-js";
import posthogServer from "@/utils/posthog";
import {
  getSitePassword,
  validateSitePassword,
} from "@/utils/password-protection";
import PasswordProtectionForm from "@/app/components/PasswordProtectionForm";
import { cookies } from "next/headers";

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

function getPublicImageUrl(supabase: SupabaseClient, path: string) {
  return supabase.storage.from("images").getPublicUrl(path).data.publicUrl;
}

interface Props {
  params: Promise<{ domain: string; albumSlugOrId: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { domain, albumSlugOrId } = await params;
  const supabase = await createServiceClient();
  const serverApi = createServerApi(supabase);
  const host = domain.replace(".myphotos.site", "");

  const site = await serverApi.getSiteByUsername(host).catch((e) => {
    logger.error(e, "generateMetadata getSiteByUsername error");
    return null;
  });

  if (!site) {
    return {
      title: `MyPhotos.site - ${domain}.myphotos.site is available!`,
    };
  }

  const layoutConfig = site.layout_config as LayoutConfig;
  const album = await getAlbum(serverApi, albumSlugOrId, site.user_id);

  if (!album) {
    return {
      title: `Album not found - ${layoutConfig.content?.title?.value || "Photo Gallery"}`,
    };
  }

  let title = `${album.title} - ${layoutConfig.content?.title?.value || "Photo Gallery"}`;
  let description =
    album.description || layoutConfig.content?.description?.value || "";
  let ogImage: string | undefined;

  // Get album cover photo
  if (album.cover_image_id) {
    const coverPhotos = await serverApi.getImageByIds([album.cover_image_id]);
    const coverPhoto = coverPhotos[0];

    if (coverPhoto) {
      ogImage = getPublicImageUrl(supabase, coverPhoto.image_path);
    }
  }

  // If no cover photo, try to get first album photo
  if (!ogImage) {
    const { data: images } = await supabase
      .from("processed_images")
      .select("*")
      .eq("album_id", album.id)
      .limit(1);

    if (images?.[0]) {
      ogImage = getPublicImageUrl(supabase, images[0].image_path);
    }
  }

  // Ensure the URL is absolute
  if (ogImage && !ogImage.startsWith("http")) {
    ogImage = `${process.env.NEXT_PUBLIC_SITE_URL}${ogImage}`;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function AlbumPage({
  params,
  searchParams,
}: {
  params: Promise<{ domain: string; albumSlugOrId: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { domain, albumSlugOrId } = await params;
  const { embed, hideContent, hideButtons, password } = await searchParams;
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

  const layoutConfig = site.layout_config as LayoutConfig;
  const sitePassword = layoutConfig.security?.password?.value;

  // Check password protection
  const cookiePassword = (await cookies()).get(
    `site_password_${domain}`
  )?.value;
  const isPasswordValid = validateSitePassword(sitePassword, cookiePassword);

  if (!isPasswordValid) {
    return <PasswordProtectionForm domain={domain} />;
  }

  // Increment site view count
  serverApi.incrementSiteView(site.id).catch((e) => {
    logger.error(e, "Failed to increment site view");
  });

  const album = await getAlbum(serverApi, albumSlugOrId, site.user_id);

  if (!album) {
    return <NotFound domain={domain} />;
  }

  const limits = getLimits(site);

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

  // Track embed view
  if (embed === "true") {
    posthogServer.capture({
      event: "view_embed",
      distinctId: site.user_id,
      properties: {
        domain,
        albumId: album.id,
        hideContent: hideContent === "true",
        hideButtons: hideButtons === "true",
      },
    });
  }

  return (
    <UserSite
      layoutConfig={{
        ...layoutConfig,
        content:
          hideContent === "true"
            ? {
                title: {
                  show: false,
                  value: layoutConfig.content?.title?.value || "",
                },
                description: {
                  show: false,
                  value: layoutConfig.content?.description?.value || "",
                },
              }
            : layoutConfig.content,
        buttons: hideButtons === "true" ? {} : layoutConfig.buttons,
      }}
      images={photos}
      albums={[]}
      currentAlbum={album}
      showBranding={limits.branding}
      hostname={host}
      isEmbed={embed === "true"}
    />
  );
}
