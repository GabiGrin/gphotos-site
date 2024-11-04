import { LayoutConfig, Photo, Album } from "@/types/gphotos";
import MasonryGallery from "./MasonryGallery";
import { Mail, Globe } from "lucide-react";
import ShareButton from "./buttons/ShareButton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SimpleTooltip } from "@/components/ui/simple-tooltip";
import { EmailIcon, WebsiteIcon } from "./icons/icons";
import Link from "next/link";
import BrandingFooter from "./BrandingFooter";

export default function UserSite({
  layoutConfig,
  images,
  album,
  domain,
}: {
  layoutConfig: LayoutConfig;
  images: Photo[];
  album?: Album;
  domain?: string;
}) {
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
          {album && (
            <Link
              href={`/`}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors relative mb-4"
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
          )}
          {/* Action buttons container */}
          <div className="w-full flex justify-center md:justify-between items-start mb-8 md:mb-0 md:absolute z-0">
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
            {album ? (
              <h1 className="text-3xl mb-6 px-4 tracking-tight">
                {album.title}
              </h1>
            ) : (
              layoutConfig.content?.title?.show && (
                <h1 className="text-3xl mb-6 px-4 tracking-tight">
                  {layoutConfig.content.title.value}
                </h1>
              )
            )}
            {layoutConfig.content?.description?.show && (
              <h3 className="text-center mb-6 text-[#444] tracking-tight">
                {album?.description ?? layoutConfig.content.description.value}
              </h3>
            )}
          </header>
          <MasonryGallery
            images={sortedImages}
            maxColumns={layoutConfig.maxColumns || 3}
          />
        </div>
        <BrandingFooter />
      </div>
    </TooltipProvider>
  );
}
