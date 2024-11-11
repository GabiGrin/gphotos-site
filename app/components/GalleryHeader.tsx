import { LayoutConfig, Album } from "@/types/gphotos";
import Link from "next/link";
import { SimpleTooltip } from "@/components/ui/simple-tooltip";
import { EmailIcon, WebsiteIcon } from "./icons/icons";
import ShareButton from "./buttons/ShareButton";

interface GalleryHeaderProps {
  layoutConfig: LayoutConfig;
  currentAlbum?: Album;
}

export default function GalleryHeader({
  layoutConfig,
  currentAlbum,
}: GalleryHeaderProps) {
  return (
    <>
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
    </>
  );
}
