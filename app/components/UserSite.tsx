import { LayoutConfig, Photo, ProcessedImage } from "@/types/gphotos";
import MasonryGallery from "./MasonryGallery";

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
        <header className="flex flex-col items-center max-w-4xl mb-8">
          <h1 className="text-3xl mb-6 px-4 tracking-tight	">
            {layoutConfig.content?.title}
          </h1>
          <h3 className="text-center mb-6 text-[#444] tracking-tight	">
            {layoutConfig.content?.description}
          </h3>
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
