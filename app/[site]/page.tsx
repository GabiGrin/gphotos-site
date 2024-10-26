import { createServiceClient } from "@/utils/supabase/service";
import dynamic from "next/dynamic";
import MasonryGallery from "../components/MasonryGallery";

// Define the type for our image data
type ProcessedImage = {
  user_id: string;
  public_url: string;
  thumbnail_url: string;
  created_at: string;
  path: string;
};

export default async function UserGallery({
  params,
}: {
  params: { site: string };
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">User Gallery</h1>
      <MasonryGallery images={images as ProcessedImage[]} />
    </div>
  );
}
