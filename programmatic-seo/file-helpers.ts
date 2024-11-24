import path from "path";
import { ArticleType, GalleryType, Platform } from "./types";
import fs from "fs/promises";

export function getArticleFileName(
  platform: Platform,
  galleryType: GalleryType,
  articleType: ArticleType,
  platform2?: Platform
): string {
  switch (articleType) {
    case ArticleType.HowToCreateGalleryWebsite:
      return `${platform.toLowerCase()}-${galleryType.toLowerCase().replace(/ /g, "-")}`;
    case ArticleType.GalleryTypePlatformComparison:
      if (!platform2) {
        throw new Error(
          "Platform 2 is required for gallery type platform comparison"
        );
      }
      return `gallery-${galleryType.toLowerCase().replace(/ /g, "-")}-${platform.toLowerCase().replace(/ /g, "-")}-vs-${platform2?.toLowerCase().replace(/ /g, "-")}`;
  }
}

export async function articleExists(fileName: string): Promise<boolean> {
  const articlesDir = path.join(process.cwd(), "articles");
  try {
    await fs.access(path.join(articlesDir, fileName));
    return true;
  } catch {
    return false;
  }
}
