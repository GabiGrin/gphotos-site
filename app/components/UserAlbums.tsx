import { Album, LayoutConfig } from "@/types/gphotos";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SimpleTooltip } from "@/components/ui/simple-tooltip";
import { EmailIcon, WebsiteIcon } from "./icons/icons";
import Link from "next/link";
import ShareButton from "./buttons/ShareButton";

export default function UserAlbums({
  layoutConfig,
  albums,
}: {
  layoutConfig: LayoutConfig;
  albums: Album[];
}) {
  return (
    <TooltipProvider>
      <div className="flex flex-col min-h-screen mx-4">
        <div className="flex-grow flex flex-col items-center py-4 mt-8 max-w-6xl mx-auto pb-16 w-full relative 2xl:max-w-7xl">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {albums.map((album) => (
              <Link
                key={album.id}
                href={`/${album.id}`}
                className="group relative aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow"
              >
                {/* {album.cover_image && (
                  <img
                    src={album.cover_image}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )} */}
                <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-50 transition-all flex items-end">
                  <div className="p-4 w-full">
                    <h3 className="text-white text-xl font-semibold">
                      {album.title}
                    </h3>
                    <p className="text-white/80 text-sm">
                      {/* {album.photo_count} photos */}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        {/* Footer remains the same as UserSite */}
      </div>
    </TooltipProvider>
  );
}
