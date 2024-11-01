import { LayoutConfig, Photo } from "@/types/gphotos";
import MasonryGallery from "./MasonryGallery";
import { Mail, Globe, Share2 } from "lucide-react";

export default function UserSite({
  layoutConfig,
  images,
}: {
  layoutConfig: LayoutConfig;
  images: Photo[];
}) {
  return (
    <div className="flex flex-col min-h-screen mx-2 w-full">
      <div className="flex-grow flex flex-col items-center py-4 mt-8 max-w-6xl mx-auto pb-16">
        {/* Share button on the left */}
        {layoutConfig.buttons?.share?.show && (
          <button
            className="fixed left-4 top-4 p-2 rounded-full bg-white bg-opacity-80 backdrop-blur-sm shadow-md hover:bg-opacity-100 transition-all duration-200"
            onClick={() => {
              navigator
                .share({
                  title: layoutConfig.content?.title?.value || "Photo Gallery",
                  url: window.location.href,
                })
                .catch(console.error);
            }}
          >
            <Share2 className="w-5 h-5 text-gray-700" />
          </button>
        )}

        {/* Email and Website buttons on the right */}
        <div className="fixed right-4 top-4 flex flex-col gap-2">
          {layoutConfig.buttons?.email?.show && (
            <a
              href={`mailto:${layoutConfig.buttons.email.value}`}
              className="p-2 rounded-full bg-white bg-opacity-80 backdrop-blur-sm shadow-md hover:bg-opacity-100 transition-all duration-200"
            >
              <Mail className="w-5 h-5 text-gray-700" />
            </a>
          )}
          {layoutConfig.buttons?.website?.show && (
            <a
              href={layoutConfig.buttons.website.value}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white bg-opacity-80 backdrop-blur-sm shadow-md hover:bg-opacity-100 transition-all duration-200"
            >
              <Globe className="w-5 h-5 text-gray-700" />
            </a>
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
  );
}
