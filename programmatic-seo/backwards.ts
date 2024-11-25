import path from "path";
import fs from "fs/promises";

import { FullArticle } from ".";
import { imagePrompts, generateGalleryImage } from "./generate-images";
import { GalleryType, Platform } from "./types";
import { logProgress } from "./logger";
import { openAi } from "./openai";

export async function migrateExistingArticles() {
  const articlesDir = path.join(process.cwd(), "articles");
  const files = await fs.readdir(articlesDir);

  for (const file of files) {
    if (!file.endsWith(".json")) continue;

    const filePath = path.join(articlesDir, file);
    const content = await fs.readFile(filePath, "utf-8");
    const article = JSON.parse(content);

    try {
      if (!Array.isArray(article.images) || article.images.length < 2) {
        logProgress(`Migrating ${file} to two images`, "info");

        const platform = article.platform;
        const galleryType = article.galleryType;

        if (!platform || !galleryType) {
          throw new Error(`Missing platform or galleryType in article data`);
        }

        // If there's an existing image, only generate one new image
        const baseImageName = `${platform.toLowerCase()}-${galleryType.toLowerCase().replace(/ /g, "-")}`;
        if (article.image) {
          const secondImageName = `${baseImageName}-2.jpg`;

          const prompt = imagePrompts[galleryType as GalleryType][1];
          const response = await generateGalleryImage(
            prompt,
            secondImageName,
            openAi
          );

          article.images = [article.image, response];
        } else {
          // If no existing image, generate both
          const prompts = imagePrompts[galleryType as GalleryType];

          const newImages = await Promise.all([
            generateGalleryImage(prompts[0], `${baseImageName}-1.jpg`, openAi),
            generateGalleryImage(prompts[1], `${baseImageName}-2.jpg`, openAi),
          ]);
          galleryType as GalleryType;

          article.images = newImages;
        }

        delete article.image;

        await fs.writeFile(filePath, JSON.stringify(article, null, 2));
        logProgress(`Successfully migrated ${file} to two images`, "success");
      }
    } catch (error) {
      if (error instanceof Error) {
        logProgress(`Failed to migrate ${file}: ${error.message}`, "error");
      } else {
        logProgress(`Failed to migrate ${file}: Unknown error`, "error");
      }
    }
  }
}

export function generateBasicToc(
  platform: Platform,
  galleryType: GalleryType
): string {
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);

  return `<ul><li>Introduction</li><li>Step-by-Step Guide: Creating a ${galleryType} Gallery on ${platformName}</li><li>Why MyPhotos.site Might Be a Better Option</li><li>Conclusion</li></ul>`;
}

export async function migrateArticlesBackwards() {
  const articlesDir = path.join(process.cwd(), "articles");
  const files = await fs.readdir(articlesDir);

  for (const file of files) {
    if (!file.endsWith(".json")) continue;

    const filePath = path.join(articlesDir, file);
    const content = await fs.readFile(filePath, "utf-8");
    const article = JSON.parse(content) as FullArticle;

    try {
      let modified = false;

      if (!article.slug) {
        article.slug = `${article.platform.toLowerCase()}-${article.galleryType
          .toLowerCase()
          .replace(/ /g, "-")}-gallery-website`;
        modified = true;
      }

      if (!article.tocHtml) {
        article.tocHtml = generateBasicToc(
          article.platform,
          article.galleryType
        );
        modified = true;
      }

      if (modified) {
        await fs.writeFile(filePath, JSON.stringify(article, null, 2));
        logProgress(`Updated ${file} with missing fields`, "success");
      } else {
        logProgress(`Skipping ${file} - already has all fields`, "info");
      }
    } catch (error) {
      if (error instanceof Error) {
        logProgress(`Failed to migrate ${file}: ${error.message}`, "error");
      } else {
        logProgress(`Failed to migrate ${file}: Unknown error`, "error");
      }
    }
  }
}
