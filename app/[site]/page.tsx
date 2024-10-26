import { createServiceClient } from "@/utils/supabase/service";
import MasonryGallery from "../components/MasonryGallery";

// Define the type for our image data
type ProcessedImage = {
  id: string;
  user_id: string;
  public_url: string;
  thumbnail_url: string;
  created_at: string;
};

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
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching images:", error);
    return <div>Error loading images. Please try again later.</div>;
  }

  if (!images || images.length === 0) {
    return <div>No images found for this user.</div>;
  }

  return (
    <div className="flex flex-col items-center py-4">
      <header className="flex flex-col items-center max-w-2xl">
        <h1 className="text-3xl mb-6 px-4">Gabriel's Photography</h1>
        <h3 className="text-center mb-6 text-[#444]">
          Welcome, my name is Gabriel Grinberg and I love taking pictures on my
          phone. Feel free to explore and reach out for more information.
        </h3>
      </header>
      <MasonryGallery images={images} />
      <footer className="text-center mt-4">
        Powered by{" "}
        <a
          href="https://photos.gphotos.app"
          target="_blank"
          className="text-blue-800 font-bold"
        >
          GPhotos.site
        </a>
      </footer>
    </div>
    // <div className="w-full">
    //   {/* <h1 className="text-3xl font-bold mb-6 px-4">User Gallery</h1> */}
    // </div>
  );
}
