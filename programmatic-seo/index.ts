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
}

export interface HowToCreateGalleryArticle
  extends BaseArticle,
    BaseArticleGeneratedContent {}

async function saveArticle(article: HowToCreateGalleryArticle) {
  const fileName = getArticleFileName(
    article.platform,
    article.galleryType,
    ArticleType.HowToCreateGalleryWebsite
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
): Promise<HowToCreateGalleryArticle> {
  const title = `How to Create a ${galleryType} Gallery Website on ${platform}`;
  logProgress(`Starting generation for: ${title}`);

  const [content, images] = await Promise.all([
    generateHowToCreateGalleryWebsiteArticleContent(
      title,
      platform,
      galleryType
    ),
    generateGalleryImages(platform, galleryType, openAi),
  ]);
  logProgress(`Successfully generated content and images`, "success");

  const slug = `${platform.replace(/ /g, "-").toLowerCase()}-${galleryType
    .replace(/ /g, "-")
    .toLowerCase()}-gallery-website`;

  const article = {
    title,
    platform,
    galleryType,
    ...content,
    images,
    facts: galleryStats[galleryType],
    slug,
  };

  return article;
}

async function generateAllArticles() {
  logProgress("Starting migration of existing articles", "info");
  await migrateExistingArticles();
  await migrateArticlesBackwards();
  logProgress("Finished migrating existing articles", "success");

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

  const totalArticles = platformsToUse.length * typesToUse.length;
  logProgress(`Starting generation of ${totalArticles} articles`, "info");

  const articlesDir = path.join(process.cwd(), "articles");
  await fs.mkdir(articlesDir, { recursive: true });

  for (const platform of platformsToUse) {
    logProgress(`Processing platform: ${platform}`, "info");

    for (let i = 0; i < typesToUse.length; i += 3) {
      const chunk = typesToUse.slice(i, i + 3);
      const chunkTasks = chunk.map(async (galleryType) => {
        const fileName = getArticleFileName(
          platform,
          galleryType,
          ArticleType.HowToCreateGalleryWebsite
        );

        try {
          logProgress(`Generating article: ${platform} - ${galleryType}`);
          const article = await generateHowToCreateGalleryArticle(
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
