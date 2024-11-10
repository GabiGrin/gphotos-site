import { LayoutConfig, Photo, Album } from "@/types/gphotos";
import MasonryGallery from "./MasonryGallery";
import { Mail, Globe, ImageIcon } from "lucide-react";
import ShareButton from "./buttons/ShareButton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SimpleTooltip } from "@/components/ui/simple-tooltip";
import { EmailIcon, WebsiteIcon } from "./icons/icons";
import Link from "next/link";
import BrandingFooter from "./BrandingFooter";

interface UserSiteProps {
  layoutConfig: LayoutConfig;
  images: Photo[];
  albums: Album[];
  currentAlbum?: Album;
  showBranding: boolean;
}

export default function UserSite({
  layoutConfig,
  images,
  albums,
  currentAlbum,
  showBranding,
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
      <div className="flex flex-col min-h-screen mx-4">
        <div className="flex-grow flex flex-col items-center py-4 mt-8 max-w-6xl mx-auto pb-16 w-full relative 2xl:max-w-7xl">
          {/* Back to albums link when viewing an album */}
          {currentAlbum && (
            <>
              <Link
                href={`/`}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors relative mb-4 z-10"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to albums
              </Link>
              {layoutConfig.content?.title?.show && (
                <h2 className="font-medium mb-4 px-4 tracking-tight text-lg">
                  {layoutConfig.content.title.value}
                </h2>
              )}
            </>
          )}
          {/* Action buttons container */}
          <div className="w-full flex justify-center md:justify-between items-start mb-8 md:mb-0 md:absolute relative z-0">
            {/* Email and Website buttons */}
            <div className="flex flex-row md:flex-col gap-2">
              {layoutConfig.buttons?.email?.show && (
                <SimpleTooltip content="Contact via Email" side="right">
                  <a
                    href={`mailto:${layoutConfig.buttons.email.value}?subject=Inquiry about your GPhotos.site gallery`}
                    className="main-btn icon-btn"
                  >
                    <EmailIcon />
                  </a>
                </SimpleTooltip>
              )}
              {layoutConfig.buttons?.website?.show && (
                <SimpleTooltip content="Visit Author's Website" side="right">
                  <a
                    href={layoutConfig.buttons.website.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="main-btn icon-btn !py-[5px]"
                  >
                    <WebsiteIcon />
                  </a>
                </SimpleTooltip>
              )}
            </div>

            {/* Share button */}
            {layoutConfig.buttons?.share?.show && (
              <div className="md:absolute md:right-0 ">
                <ShareButton
                  title={layoutConfig.content?.title?.value || "Photo Gallery"}
                />
              </div>
            )}
          </div>

          <header className="flex flex-col items-center max-w-4xl mb-8">
            {layoutConfig.content?.title?.show && (
              <h1 className="text-4xl mb-4 px-4 tracking-tight">
                {currentAlbum?.title ?? layoutConfig.content.title.value}
              </h1>
            )}
            {layoutConfig.content?.description?.show && (
              <h3 className="text-center mb-6 text-[#515151] tracking-tight text-[16px]">
                {currentAlbum?.description ??
                  layoutConfig.content.description.value}
              </h3>
            )}
          </header>
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
        {showBranding && <BrandingFooter />}
      </div>
    </TooltipProvider>
  );
}
