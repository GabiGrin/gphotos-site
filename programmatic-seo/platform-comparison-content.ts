import path from "path";
import { BaseArticleGeneratedContent, FullArticle } from ".";
import { logCost, calculateTokenCost } from "./costs";
import { logProgress } from "./logger";
import { openAi } from "./openai";
import { ArticleType, GalleryType, Platform } from "./types";
import fs from "fs/promises";
import { articleExists, getArticleFileName } from "./file-helpers";

export async function generatePlatformComparisonArticleContent(
  title: string,
  platform1: Platform,
  platform2: Platform,
  galleryType: GalleryType
): Promise<FullArticle> {
  const filename = getArticleFileName(
    platform1,
    galleryType,
    ArticleType.GalleryTypePlatformComparison,
    platform2
  );

  if (await articleExists(filename)) {
    logProgress(
      `Skipping content generation, found existing article: ${filename}`,
      "warning"
    );
    const raw = await fs.readFile(
      path.join(process.cwd(), "articles", filename),
      "utf-8"
    );
    return JSON.parse(raw);
  }

  const contentPrompt = `You are a master photographer, gallery website builder turned blog post SEO writer.
Your job is to help write articles for "MyPhotos.site".

myphotos.site is a simple, intuitive platform designed to help users effortlessly organize and showcase their photo collections. With seamless Google Photos import and customizable galleries, it's perfect for individuals, photographers, or small businesses looking for an easy way to manage and display their images. Whether you're starting with the free plan or upgrading to unlock more features, myphotos.site keeps everything straightforward and elegant, letting you focus on your memories or portfolio without the hassle.

You will receive a title of an article, and you should write it through. 
The article will be about comparing 2 different platforms for creating a specific type of gallery website.
The main content of the article should cover:
1. How to create a gallery website on each platform
2. How to create a successful gallery website of the specific type on each platform
3. How does the 2 platforms compare in terms of features, ease of use, pricing, etc.
3. Tips and tricks for each platform
4. Tips and tricks for the specific type of gallery website

output the article in this JSON format:
\`\`\`
  {
    blurb: string; // 150 characters
    tocHtml: string; // HTML 1-level bulleted list of topics covered in the article
    introductionHtml: string;
    mainContentHtml: string; // Detailed main content section (minimum 1000 words) including step-by-step instructions, tips, best practices, and examples. Don't mention myphotos.site in the main content
    mpsBetterSectionHtml: string; // how myphotos.site can be a better choice
    conclusionHtml: string;
  }
\`\`\`
- Each section is a Rich, Stand-alone HTML sections, with subheadings, links
- The mainContentHtml should be comprehensive (at least 1000 words) and include:
  - Detailed step-by-step instructions
  - Best practices and tips
  - Common pitfalls to avoid
  - Examples and use cases
  - Technical considerations
  - Design recommendations
- The tocHtml should be a <ul> list containing the main sections and subsections of the article
- Use as many links as possible (to the platform's website, myphotos.site, and other relevant links if may think of)`;

  const response = await openAi.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: contentPrompt },
      { role: "user", content: title },
    ],
    response_format: { type: "json_object" },
  });

  await logCost({
    timestamp: new Date().toISOString(),
    model: "gpt-4o",
    tokens: response.usage?.total_tokens,
    cost: calculateTokenCost("gpt-4o", response.usage?.total_tokens || 0),
    description: `Generated article content for: ${title}`,
  });

  const jsonString = response.choices[0].message.content;

  if (!jsonString) {
    throw new Error("Failed to generate article content");
  }

  let parsedContent;
  try {
    parsedContent = JSON.parse(jsonString);
  } catch (e) {
    throw new Error("Invalid JSON response from OpenAI");
  }

  const requiredFields = [
    "blurb",
    "tocHtml",
    "introductionHtml",
    "mainContentHtml",
    "mpsBetterSectionHtml",
    "conclusionHtml",
  ];
  for (const field of requiredFields) {
    if (!(field in parsedContent)) {
      throw new Error(`Missing required field: ${field}`);
    }
    if (typeof parsedContent[field] !== "string") {
      throw new Error(`Field ${field} must be a string`);
    }
  }

  return parsedContent;
}
