import { uploadArticleToWebflow } from "./webflow";
import fs from "fs/promises";
import path from "path";

interface ArticleWithPath {
  content: any;
  filePath: string;
}

async function getAllArticles(): Promise<ArticleWithPath[]> {
  const articlesDir = path.join(process.cwd(), "articles");
  const files = await fs.readdir(articlesDir);

  const articles = await Promise.all(
    files
      .filter((file) => file.endsWith(".json"))
      .map(async (file) => {
        const filePath = path.join(articlesDir, file);
        const content = await fs.readFile(filePath, "utf-8");
        return {
          content: JSON.parse(content),
          filePath,
        };
      })
  );

  return articles;
}

async function markArticleAsUploaded(filePath: string) {
  const content = await fs.readFile(filePath, "utf-8");
  const article = JSON.parse(content);

  // Add uploaded flag and timestamp
  article.uploaded = true;
  article.uploadedAt = new Date().toISOString();

  // Write back to file with proper formatting
  await fs.writeFile(filePath, JSON.stringify(article, null, 2), "utf-8");
}

async function main() {
  try {
    let articles = await getAllArticles();

    console.log(`Found ${articles.length} articles to process`);

    for (const article of articles) {
      if (article.content.uploaded) {
        console.log(
          `Skipping already uploaded article: ${article.content.slug}`
        );
        continue;
      }
      console.log(`Uploading article: ${article.content.slug}`);
      await uploadArticleToWebflow(article.content);
      console.log(`Marking article as uploaded: ${article.content.slug}`);
      await markArticleAsUploaded(article.filePath);
      console.log(`Marked as uploaded: ${article.filePath}`);

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.error("Error processing articles:", error);
    process.exit(1);
  }
}

main();
