import { createServiceClient } from "@/utils/supabase/service";
import MasonryGallery from "../../components/MasonryGallery";
import Link from "next/link";
import { createServerApi } from "@/utils/dal/server-api";
import logger from "@/utils/logger";
import NotFound from "./not-found";
import posthogServer from "@/utils/posthog";
import { AlbumWithCoverPhoto, LayoutConfig, Photo } from "@/types/myphotos";
import { Metadata, ResolvingMetadata } from "next";
import UserSite from "@/app/components/UserSite";
import UserAlbums from "@/app/components/UserAlbums";
import { processedImageToPhoto } from "@/utils/dal/api-utils";
import { getLimits } from "@/premium/plans";
import { SupabaseClient } from "@supabase/supabase-js";
import {
  getSitePassword,
  validateSitePassword,
} from "@/utils/password-protection";
import PasswordProtectionForm from "@/app/components/PasswordProtectionForm";
import { cookies } from "next/headers";

interface Props {
  params: Promise<{ domain: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

function getPublicImageUrl(supabase: SupabaseClient, path: string) {
  return supabase.storage.from("images").getPublicUrl(path).data.publicUrl;
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { domain } = await params;
  const albumSlug = (await searchParams).album;

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

  // Get first image for OpenGraph
  const images = await serverApi.getProcessedImages(site.user_id);
  const firstImage = images[0];

  let title = layoutConfig.content?.title?.value || "Photo Gallery";
  let description = layoutConfig.content?.description?.value || "";
  let ogImage = firstImage
    ? getPublicImageUrl(supabase, firstImage.image_path)
    : undefined;

  // If album view, get album-specific metadata
  if (albumSlug) {
    const album = await serverApi.getAlbumBySlug(albumSlug, site.user_id);

    if (album) {
      title = `${album.title} - ${title}`;
      description = album.description || description;

      // Use album cover photo if available
      if (album.cover_image_id) {
        // Get the cover photo directly from the server
        const coverPhotos = await serverApi.getImageByIds([
          album.cover_image_id,
        ]);
        const coverPhoto = coverPhotos[0];

        if (coverPhoto) {
          ogImage = getPublicImageUrl(supabase, coverPhoto.image_path);
        }
      }
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

export default async function UserGallery({
  params,
  searchParams,
}: {
  params: Promise<{ domain: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { domain } = await params;
  const { embed, hideContent, hideButtons, password } = await searchParams;
  const supabase = await createServiceClient();
  const serverApi = createServerApi(supabase);
  const host = domain.replace(".myphotos.site", "");

  const site = await serverApi.getSiteByUsername(host).catch((e) => {
    logger.error(e, "UserGallery getSiteByUsername error");
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

  const limits = getLimits(site);

  const sortOrder = layoutConfig.sort === "oldest" ? true : false; // true for ascending (oldest), false for descending (newest)

  const { data: images, error } = await supabase
    .from("processed_images")
    .select("*")
    .eq("user_id", site.user_id)
    .order("gphotos_created_at", { ascending: sortOrder });

  if (error) {
    logger.error(error, "UserGallery getProcessedImages error");
    return <div>Error loading images. Please try again later.</div>;
  }

  console.log(44, images.length);

  posthogServer.capture({
    event: "view_site",
    distinctId: site.user_id,
    properties: {
      domain,
    },
  });

  const photos: Photo[] = images.map((image) =>
    processedImageToPhoto(supabase, image)
  );

  // Fetch albums
  const rawAlbums = await serverApi.getAlbumsByUserId(site.user_id);

  const albumPhotos =
    rawAlbums.length > 0
      ? await serverApi.getImageByIds(
          rawAlbums.flatMap((album) => album.cover_image_id ?? [])
        )
      : [];

  const albums = rawAlbums.map((album) => ({
    ...album,
    coverPhoto: albumPhotos.find((photo) => photo.id === album.cover_image_id),
  })) as AlbumWithCoverPhoto[];

  if (rawAlbums && albums.length > 0) {
    return (
      <UserAlbums
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
        albums={albums}
        showBrandingFooter={limits.branding}
        hostname={host}
        isEmbed={embed === "true"}
      />
    );
  }

  // Track embed view
  if (embed === "true") {
    posthogServer.capture({
      event: "view_embed",
      distinctId: site.user_id,
      properties: {
        domain,
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
      albums={albums}
      showBranding={limits.branding}
      hostname={host}
      isEmbed={embed === "true"}
    />
  );
}
