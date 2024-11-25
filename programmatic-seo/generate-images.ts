import path from "path";
import { logCost, calculateImageCost } from "./costs";
import fs from "fs/promises";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { Platform, GalleryType, ArticleType } from "./types";
import { existsSync } from "fs";
import { slugify } from "./slugify";

async function imagesExist(
  platform: Platform,
  galleryType: GalleryType
): Promise<boolean> {
  const imagesDir = path.join(process.cwd(), "public", "images");
  const imagePath = path.join(
    imagesDir,
    `${platform.toLowerCase()}-${galleryType.toLowerCase().replace(/ /g, "-")}.jpg`
  );

  try {
    await fs.access(imagePath);
    return true;
  } catch {
    return false;
  }
}

export const imagePrompts: Record<GalleryType, [string, string]> = {
  [GalleryType.Wedding]: [
    `Real wedding celebration in a luxurious venue, guests mingling, professional photographer with DSLR camera visible`,
    `Wedding ceremony setup with decorations, photographer capturing intimate moments, natural lighting`,
  ],
  [GalleryType.Conference]: [
    `Modern business conference in convention center, attendees networking, event photographer with professional gear`,
    `Conference presentation with audience, photographer documenting keynote speech`,
  ],
  [GalleryType.Travel]: [
    `Real tourist destination with natural scenery, travelers exploring, photographer with camera equipment`,
    `Tourist attraction with natural scenery, tourists enjoying, photographer with professional gear`,
  ],
  [GalleryType.Anniversary]: [
    `Upscale restaurant celebration, elegant decorations, photographer discreetly working`,
    `Anniversary party with guests, photographer capturing family moments`,
  ],
  [GalleryType.Birthday]: [
    `Home birthday celebration with realistic decorations, photographer capturing candid moments`,
    `Birthday party with guests, photographer capturing family moments`,
  ],
  [GalleryType["Family Reunion"]]: [
    `Outdoor family gathering at park or backyard, photographer setting up group shot`,
    `Family reunion with guests, photographer capturing family moments`,
  ],
  [GalleryType.Graduation]: [
    `University graduation ceremony, realistic campus setting, photographer with professional camera`,
    `Graduation ceremony with students, photographer capturing moments`,
  ],
  [GalleryType["Baby Shower"]]: [
    `Indoor baby shower in decorated home, photographer documenting celebrations`,
    `Baby shower with guests, photographer capturing family moments`,
  ],
  [GalleryType["Corporate Event"]]: [
    `Corporate office or hotel venue event, photographer with professional equipment`,
    `Corporate event with attendees, photographer documenting keynote speech`,
  ],
  [GalleryType["Sports Event"]]: [
    `Live sports match with crowd, sports photographer with telephoto lens`,
    `Sports event with audience, photographer capturing moments`,
  ],
  [GalleryType["Holiday Celebration"]]: [
    `Real home holiday gathering, natural decorations, photographer capturing family moments`,
    `Holiday gathering with guests, photographer capturing family moments`,
  ],
  [GalleryType["Nonprofit Campaign"]]: [
    `Real community service location, volunteers working, photographer documenting`,
    `Nonprofit campaign event with attendees, photographer documenting moments`,
  ],
  [GalleryType["Memorials and Tributes"]]: [
    `Solemn indoor memorial service, photographer respectfully capturing moments`,
    `Memorial service with guests, photographer respectfully capturing moments`,
  ],
  [GalleryType.Festival]: [
    `Outdoor music or cultural festival, crowds enjoying, photographer with professional gear`,
    `Festival event with attendees, photographer with professional gear`,
  ],
  [GalleryType["Cultural Ceremony"]]: [
    `Authentic cultural celebration indoors, photographer documenting traditions`,
    `Cultural ceremony with attendees, photographer documenting traditions`,
  ],
};

export async function generateGalleryImage(
  prompt: string,
  fileName: string,
  openAi: OpenAI
): Promise<string> {
  if (existsSync(path.join(process.cwd(), "public", "images", fileName))) {
    console.log(`Image ${fileName} already exists, skipping generation`);
    return `https://ffwdqslcgzreiytehizw.supabase.co/storage/v1/object/public/website/images/${fileName}`;
  }

  console.log(`Generating image ${fileName}`);

  const response = await openAi.images.generate({
    model: "dall-e-3",
    prompt: `${prompt}, hyperrealistic photography, high-end DSLR quality, natural lighting, no artificial or cartoon effects, 4k detail, landscape orientation. Use mostly non-ethnic people.`,
    size: "1792x1024",
    quality: "standard",
    n: 1,
  });

  await logCost({
    timestamp: new Date().toISOString(),
    model: "dall-e-3",
    images: 1,
    cost: calculateImageCost("dall-e-3", 1),
    description: `Generated image for ${fileName}: ${prompt.substring(0, 50)}...`,
  });

  const url = response.data[0].url;
  if (!url) throw new Error("No image URL received");

  return downloadImage(url, fileName);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function uploadImageToSupabase(
  buffer: Buffer,
  fileName: string
): Promise<string> {
  const { data, error } = await supabase.storage
    .from("website")
    .upload(`images/${fileName}`, buffer, {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (error) throw new Error(`Failed to upload to Supabase: ${error.message}`);

  const {
    data: { publicUrl },
  } = supabase.storage.from("website").getPublicUrl(`images/${fileName}`);

  return publicUrl;
}

export async function downloadImage(
  url: string,
  fileName: string
): Promise<string> {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();

  const publicUrl = await uploadImageToSupabase(Buffer.from(buffer), fileName);

  const imagesDir = path.join(process.cwd(), "public", "images");
  await fs.mkdir(imagesDir, { recursive: true });
  const filePath = path.join(imagesDir, fileName);
  await fs.writeFile(filePath, Buffer.from(buffer));

  return publicUrl;
}

export async function generateGalleryImages(
  platform: Platform,
  galleryType: GalleryType,
  articleType: ArticleType,
  openAi: OpenAI,
  platform2?: Platform
): Promise<[string, string]> {
  const prompts = imagePrompts[galleryType];

  return Promise.all([
    generateGalleryImage(
      prompts[0],
      slugify(`${platform} ${galleryType} ${articleType} 1`) + ".jpg",
      openAi
    ),
    generateGalleryImage(
      prompts[1],
      slugify(`${platform} ${galleryType} ${articleType} 2`) + ".jpg",
      openAi
    ),
  ]);
}
