import { LayoutConfig, Photo } from "@/types/gphotos";
import MasonryGallery from "./MasonryGallery";
import { Mail, Globe } from "lucide-react";
import ShareButton from "./buttons/ShareButton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SimpleTooltip } from "@/components/ui/simple-tooltip";
import { EmailIcon, WebsiteIcon } from "./icons/icons";

export default function UserSite({
  layoutConfig,
  images,
}: {
  layoutConfig: LayoutConfig;
  images: Photo[];
}) {
  return (
    <TooltipProvider>
      <div className="flex flex-col min-h-screen mx-4">
        <div className="flex-grow flex flex-col items-center py-4 mt-8 max-w-6xl mx-auto pb-16 w-full relative">
          {/* Action buttons container - mobile: centered row, desktop: split to corners */}
          <div className="w-full flex justify-center md:justify-between items-center mb-8 md:mb-0">
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
              <div className="md:absolute md:right-0 md:top-4">
                <ShareButton
                  title={layoutConfig.content?.title?.value || "Photo Gallery"}
                />
              </div>
            )}
          </div>

          <header className="flex flex-col items-center max-w-4xl mb-8">
            {layoutConfig.content?.title?.show && (
              <h1 className="text-3xl mb-6 px-4 tracking-tight">
                {layoutConfig.content.title.value}
              </h1>
            )}
            {layoutConfig.content?.description?.show && (
              <h3 className="text-center mb-6 text-[#444] tracking-tight">
                {layoutConfig.content.description.value}
              </h3>
            )}
          </header>
          <MasonryGallery images={images} />
        </div>
        <footer className="fixed bottom-0 left-0 w-full py-2 bg-white bg-opacity-80 backdrop-blur-sm shadow-md">
          <div className="text-center text-xs text-gray-600">
            Powered by{" "}
            <a
              href="https://photos.gphotos.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 transition-colors duration-200 font-medium"
            >
              GPhotos.site
            </a>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}
