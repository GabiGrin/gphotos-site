import { createServiceClient } from "@/utils/supabase/service";
import MasonryGallery from "../components/MasonryGallery";
import Link from "next/link";

export default async function UserGallery({
  params,
}: {
  params: Promise<{ site: string }>;
}) {
  const { site } = await params;
  const supabase = await createServiceClient();

  // Fetch processed images for the user from Supabase

  const { data: images, error } = await supabase
    .from("processed_images")
    .select("*")
    .eq("user_id", site)
    .order("gphotos_created_at", { ascending: false });

  // if (error) {
  //   console.error("Error fetching images:", error);
  //   return <div>Error loading images. Please try again later.</div>;
  // }

  if (!images || images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800">
        <div className="max-w-md text-center px-4">
          <h1 className="text-4xl font-bold mb-4">Site Not Found</h1>
          <p className="text-xl mb-8">{site}.gphotos.site is available!</p>
          <p className="text-lg mb-8">
            Create your own beautiful photo gallery with GPhotos.site in
            minutes.
          </p>
          <Link
            href="/sign-up"
            className="bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors duration-200"
          >
            Sign Up Now
          </Link>
        </div>
      </div>
    );
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
