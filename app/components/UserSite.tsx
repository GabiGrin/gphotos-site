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
        <footer className="fixed bottom-0 left-0 w-full py-2.5 bg-white bg-opacity-80 backdrop-blur-sm shadow-md">
          <div className="container mx-auto flex items-center justify-center px-4">
            <div className="text-xs text-gray-600">
              Made with{" "}
              <a
                href="https://app.gphotos.site"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 transition-colors duration-200 font-medium inline-flex items-center gap-1 group"
              >
                GPhotos.site
                <svg
                  className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="https://app.gphotos.site?utm_source=gphotos.site"
                target="_blank"
                rel="noopener"
                className="text-xs px-3 py-1 rounded-full bg-blue-500 text-white hover:bg-blue-800 transition-colors duration-200"
              >
                Create yours for free
              </a>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}
