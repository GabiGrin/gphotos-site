import { createServiceClient } from "@/utils/supabase/service";
import MasonryGallery from "../../components/MasonryGallery";
import Link from "next/link";
import { createServerApi } from "@/utils/server-api";
import logger from "@/utils/logger";
import NotFound from "./not-found";

export default async function UserGallery({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const supabase = await createServiceClient();

  const serverApi = createServerApi(supabase);

  // Fetch processed images for the user from Supabase

  const host = domain.replace(".gphotos.site", "");

  console.log(42, host);

  const site = await serverApi.getUserSite(host).catch((e) => {
    logger.error(e);
    return null;
  });

  console.log(42, site);

  if (!site) {
    return <NotFound domain={domain} />;
  }

  const { data: images, error } = await supabase
    .from("processed_images")
    .select("*")
    .eq("user_id", site.user_id)
    .order("gphotos_created_at", { ascending: false });

  if (error) {
    logger.error(error);
    return <div>Error loading images. Please try again later.</div>;
  }

  return (
    <div className="flex flex-col min-h-screen mx-2">
      <div className="flex-grow flex flex-col items-center py-4 mt-8 max-w-5xl mx-auto pb-16">
        <header className="flex flex-col items-center max-w-2xl mb-8">
          <h1 className="text-3xl mb-6 px-4">Gabriel's Photography</h1>
          <h3 className="text-center mb-6 text-[#444]">
            Welcome, my name is Gabriel Grinberg and I love taking pictures on
            my phone. Feel free to explore and reach out for more information.
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
