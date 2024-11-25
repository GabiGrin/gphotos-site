import { galleryStats } from "./facts";
import fs from "fs/promises";
import path from "path";
import { logCost, calculateTokenCost } from "./costs";

import "dotenv/config";
import { generateGalleryImages } from "./generate-images";
import { Platform, GalleryType, ArticleType } from "./types";
import { logProgress } from "./logger";
import { openAi } from "./openai";
import { migrateArticlesBackwards, migrateExistingArticles } from "./backwards";
import { getArticleFileName } from "./file-helpers";
import { generateHowToCreateGalleryWebsiteArticleContent } from "./how-to-create-content";
import { generatePlatformComparisonArticleContent } from "./platform-comparison-content";
import { slugify } from "./slugify";
import { generateHowToUploadImagesContent } from "./how-to-upload-images-content";

export interface BaseArticleGeneratedContent {
  blurb: string;
  introductionHtml: string;
  conclusionHtml: string;
  mpsBetterSectionHtml: string;
  mainContentHtml: string;
  tocHtml: string;
}

export interface BaseArticleFactualStats {
  averagePhotos: string;
  preferredLighting: string;
  mostPopularLens: string;
  bestGalleryLayout: string;
}

export interface BaseArticle {
  title: string;
  platform: Platform;
  secondaryPlatform?: Platform;
  galleryType: GalleryType;
  images: string[];
  facts: BaseArticleFactualStats;
  slug: string;
  uploaded?: boolean;
  type: ArticleType;
}

export interface FullArticle extends BaseArticle, BaseArticleGeneratedContent {}

async function saveArticle(article: FullArticle) {
  const fileName = getArticleFileName(
    article.platform,
    article.galleryType,
    article.type,
    article.secondaryPlatform
  );
  const articlesDir = path.join(process.cwd(), "articles");

  await fs.mkdir(articlesDir, { recursive: true });
  await fs.writeFile(
    path.join(articlesDir, fileName),
    JSON.stringify(article, null, 2)
  );
  return fileName;
}

async function generateHowToCreateGalleryArticle(
  platform: Platform,
  galleryType: GalleryType
): Promise<FullArticle> {
  const title = `How to Create a ${galleryType} Gallery Website on ${platform}`;
  logProgress(`Starting generation for: ${title}`);

  const [content, images] = await Promise.all([
    generateHowToCreateGalleryWebsiteArticleContent(
      title,
      platform,
      galleryType
    ),
    generateGalleryImages(
      platform,
      galleryType,
      ArticleType.HowToCreateGalleryWebsite,
      openAi
    ),
  ]);
  logProgress(`Successfully generated content and images`, "success");

  const slug = slugify(title);

  const article = {
    title,
    platform,
    galleryType,
    ...content,
    images,
    facts: galleryStats[galleryType],
    slug,
    type: ArticleType.HowToCreateGalleryWebsite,
  };

  return article;
}

async function generatePlatformComparisonArticle(
  galleryType: GalleryType,
  platform1: Platform,
  platform2: Platform
) {
  const title = `Creating a ${galleryType} Gallery Website: ${platform1} vs ${platform2}`;

  const [content, images] = await Promise.all([
    generatePlatformComparisonArticleContent(
      title,
      platform1,
      platform2,
      galleryType
    ),
    generateGalleryImages(
      platform1,
      galleryType,
      ArticleType.GalleryTypePlatformComparison,
      openAi,
      platform2
    ),
  ]);
  logProgress(`Successfully generated content and images`, "success");

  const slug = slugify(title);

  const article: FullArticle = {
    ...content,
    galleryType,
    title,
    platform: platform1,
    secondaryPlatform: platform2,
    images,
    facts: galleryStats[galleryType],
    slug,
    type: ArticleType.GalleryTypePlatformComparison,
  };

  return article;
}

async function generateHowToUploadImagesArticle(
  platform: Platform,
  galleryType: GalleryType
) {
  const title = `How to Upload Images to a ${galleryType} Gallery Website on ${platform}`;
  const [content, images] = await Promise.all([
    generateHowToUploadImagesContent(title, platform, galleryType),
    generateGalleryImages(
      platform,
      galleryType,
      ArticleType.HowToUploadImages,
      openAi
    ),
  ]);

  const slug = slugify(title);

  const article: FullArticle = {
    ...content,
    galleryType,
    title,
    platform,
    images,
    facts: galleryStats[galleryType],
    slug,
    type: ArticleType.HowToUploadImages,
  };

  return article;
}

async function generateAllArticles() {
  const platformsToUse = [
    Platform.Wix,
    Platform.Squarespace,
    Platform.WordPress,
    Platform.GoDaddy,
    Platform.Zenfolio,
    Platform.Pixieset,
    Platform.Weebly,
  ];
  const typesToUse = [
    GalleryType.Wedding,
    GalleryType.Conference,
    GalleryType.Travel,
    GalleryType.Birthday,
    GalleryType.Graduation,
    GalleryType["Corporate Event"],
    GalleryType["Family Reunion"],
    GalleryType["Sports Event"],
  ];
  //   const uniquePlatformCombos: [Platform, Platform][] = [];
  //   for (let i = 0; i < platformsToUse.length; i++) {
  //     for (let j = i + 1; j < platformsToUse.length; j++) {
  //       uniquePlatformCombos.push([platformsToUse[i], platformsToUse[j]]);
  //     }
  //   }

  //   console.log(uniquePlatformCombos);

  const totalArticles = platformsToUse.length * typesToUse.length;
  logProgress(`Starting generation of ${totalArticles} articles`, "info");

  const articlesDir = path.join(process.cwd(), "articles");
  await fs.mkdir(articlesDir, { recursive: true });

  for (const platform of platformsToUse) {
    logProgress(`Processing platform: ${platform}`, "info");

    const chunkSize = 3;

    for (let i = 0; i < typesToUse.length; i += chunkSize) {
      const chunk = typesToUse.slice(i, i + chunkSize);
      const chunkTasks = chunk.map(async (galleryType) => {
        const fileName = getArticleFileName(
          platform,
          galleryType,
          ArticleType.HowToUploadImages
        );

        try {
          logProgress(`Generating article: ${galleryType}, ${platform}`);
          const article = await generateHowToUploadImagesArticle(
            platform,
            galleryType
          );
          await saveArticle(article);
          logProgress(
            `Successfully generated and saved: ${fileName}`,
            "success"
          );
        } catch (error) {
          logProgress(
            `Failed to generate article for ${platform} - ${galleryType}: ${(error as any).message}`,
            "error"
          );
        }
      });
      await Promise.all(chunkTasks);
    }

    logProgress("Article generation completed", "success");
  }
}

(async () => {
  await generateAllArticles();
})();
