import { LayoutConfig, Album } from "@/types/myphotos";
import Link from "next/link";
import { SimpleTooltip } from "@/components/ui/simple-tooltip";
import { ChainIcon, EmailIcon, WebsiteIcon } from "./icons/icons";
import ShareButton from "./buttons/ShareButton";
import { LinkIcon } from "lucide-react";

interface GalleryHeaderProps {
  layoutConfig: LayoutConfig;
  currentAlbum?: Album;
}

export default function GalleryHeader({
  layoutConfig,
  currentAlbum,
}: GalleryHeaderProps) {
  return (
    <header className="mt-8 w-full">
      <div className="w-full flex justify-center md:justify-between items-start mb-8 md:mb-0 md:absolute relative z-0">
        <div className="flex flex-row md:flex-col gap-2">
          {layoutConfig.buttons?.email?.show && (
            <SimpleTooltip content="Contact via Email" side="right">
              <a
                href={`mailto:${layoutConfig.buttons.email.value}?subject=Inquiry about your MyPhotos.site gallery`}
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
                <LinkIcon className="w-5 h-5" />
              </a>
            </SimpleTooltip>
          )}
        </div>

        {layoutConfig.buttons?.share?.show && (
          <div className="md:absolute md:right-0">
            <ShareButton
              title={layoutConfig.content?.title?.value || "Photo Gallery"}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col items-center max-w-4xl mb-8 mx-auto relative z-10">
        {currentAlbum && (
          <div className="flex items-center gap-1 text-black mb-4">
            <Link href="/" className="hover:text-gray-600 transition-colors">
              {layoutConfig.content?.title?.value ?? "Photo Gallery"}
            </Link>
            <span className="text-gray-400 ">›</span>
            <span>{currentAlbum.title}</span>
          </div>
        )}

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
      </div>
    </header>
  );
}
