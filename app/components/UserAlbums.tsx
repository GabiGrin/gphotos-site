import { AlbumWithCoverPhoto, LayoutConfig } from "@/types/gphotos";
import { TooltipProvider } from "@/components/ui/tooltip";
import Link from "next/link";
import BrandingFooter from "./BrandingFooter";
import GalleryHeader from "./GalleryHeader";

export default function UserAlbums({
  layoutConfig,
  albums,
  showBrandingFooter,
  hostname,
}: {
  layoutConfig: LayoutConfig;
  albums: AlbumWithCoverPhoto[];
  showBrandingFooter: boolean;
  hostname: string;
}) {
  return (
    <TooltipProvider>
      <div className="flex flex-col min-h-screen mx-4">
        <div className="flex-grow flex flex-col items-center py-4 mt-8 max-w-6xl mx-auto pb-16 w-full relative 2xl:max-w-7xl">
          <GalleryHeader layoutConfig={layoutConfig} />

          <div className="text-[16px] mb-2 text-#515151">My albums:</div>
          <div className="w-full px-3">
            <div className="max-w-[1230px] mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 justify-center">
                {albums.map((album) => (
                  <Link
                    key={album.id}
                    href={`/${album.id}`}
                    className="w-full group flex flex-col bg-white rounded-sm overflow-hidden border border-stone-200 hover:border-gray-300 transition-all"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden">
                      {album.coverPhoto ? (
                        <img
                          src={album.coverPhoto.thumbnailUrl}
                          alt={album.title}
                          className="w-full h-full object-cover absolute inset-0"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center absolute inset-0">
                          <div className="text-gray-400">{album.title}</div>
                        </div>
                      )}
                    </div>
                    <div className="p-4 antialiased">
                      <h3 className="text-[32px] tracking-tighter letter font-medium group-hover:text-gray-700 line-clamp-1">
                        {album.title}
                      </h3>
                      {album.description && (
                        <p className="text-[16px] font-normal tracking-tight line-clamp-2 overflow-hidden text-gray-600">
                          {album.description}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
        {showBrandingFooter && <BrandingFooter hostname={hostname} />}
      </div>
    </TooltipProvider>
  );
}
