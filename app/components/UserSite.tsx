import { LayoutConfig, Photo, Album } from "@/types/myphotos";
import MasonryGallery from "./MasonryGallery";
import { Mail, Globe, ImageIcon } from "lucide-react";
import ShareButton from "./buttons/ShareButton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SimpleTooltip } from "@/components/ui/simple-tooltip";
import { EmailIcon, WebsiteIcon } from "./icons/icons";
import Link from "next/link";
import BrandingFooter from "./BrandingFooter";
import GalleryHeader from "./GalleryHeader";

interface UserSiteProps {
  layoutConfig: LayoutConfig;
  images: Photo[];
  albums: Album[];
  currentAlbum?: Album;
  showBranding: boolean;
  hostname: string;
  isEmbed: boolean;
}

export default function UserSite({
  layoutConfig,
  images,
  albums,
  currentAlbum,
  showBranding,
  hostname,
  isEmbed,
}: UserSiteProps) {
  // Sort images based on layoutConfig.sort
  const sortedImages = [...images].sort((a, b) => {
    const aDate = new Date(a.gphotos_created_at).getTime();
    const bDate = new Date(b.gphotos_created_at).getTime();
    return layoutConfig.sort === "oldest"
      ? aDate - bDate // oldest first
      : bDate - aDate; // newest first
  });

  return (
    <TooltipProvider>
      <div className={`flex flex-col min-h-screen ${isEmbed ? "" : "mx-4"}`}>
        <div
          className={`flex-grow flex flex-col items-center ${isEmbed ? "" : "py-4 mt-8"} max-w-6xl mx-auto pb-32 w-full relative 2xl:max-w-7xl`}
        >
          <GalleryHeader
            layoutConfig={layoutConfig}
            currentAlbum={currentAlbum}
          />

          {sortedImages.length > 0 ? (
            <MasonryGallery
              images={sortedImages}
              maxColumns={layoutConfig.maxColumns || 3}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <ImageIcon className="w-16 h-16 mb-4 stroke-[1.2]" />
              <p className="text-lg">No photos to display yet</p>
              {currentAlbum && (
                <p className="text-sm mt-1">This album is currently empty</p>
              )}
            </div>
          )}
        </div>
        {showBranding && <BrandingFooter hostname={hostname} />}
      </div>
    </TooltipProvider>
  );
}
