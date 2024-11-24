import express from "express";
import fs from "fs/promises";
import path from "path";

async function startPreviewServer() {
  const app = express();
  const port = 3001;

  app.use(express.static(path.join(process.cwd(), "public")));

  app.get("/", async (req, res) => {
    const articlesDir = path.join(process.cwd(), "articles");
    const files = await fs.readdir(articlesDir);

    const articleLinks = files
      .filter((f) => f.endsWith(".json"))
      .map((f) => `<li><a href="/article/${f}">${f}</a></li>`)
      .join("");

    res.send(`
      <h1>Generated Articles</h1>
      <ul>${articleLinks}</ul>
    `);
  });

  app.get("/article/:filename", async (req, res) => {
    try {
      const articlePath = path.join(
        process.cwd(),
        "articles",
        req.params.filename
      );
      const articleContent = await fs.readFile(articlePath, "utf-8");
      const article = JSON.parse(articleContent);

      res.send(`
        <style>
          body { max-width: 800px; margin: 0 auto; padding: 20px; font-family: system-ui; }
          .facts { background: #f5f5f5; padding: 20px; border-radius: 8px; }
          .images { display: flex; gap: 20px; margin: 20px 0; }
          .images img { max-width: 45%; height: auto; border-radius: 8px; }
        </style>
        <h1>${article.title}</h1>
        <p><strong>Blurb:</strong> ${article.blurb}</p>
        
        <div class="images">
          <img src="${article.images[0]}" alt="Gallery image 1">
          <img src="${article.images[1]}" alt="Gallery image 2">
        </div>

        <div class="facts">
          <h2>Gallery Stats</h2>
          <ul>
            <li>Average Photos: ${article.facts.averagePhotos}</li>
            <li>Preferred Lighting: ${article.facts.preferredLighting}</li>
            <li>Most Popular Lens: ${article.facts.mostPopularLens}</li>
            <li>Best Gallery Layout: ${article.facts.bestGalleryLayout}</li>
          </ul>
        </div>

        <details>
          <summary>Table of Contents</summary>
          ${article.tocHtml}
        </details>

        ${article.introductionHtml}
        
        ${article.mainContentHtml}
        
        ${article.mpsBetterSectionHtml}
        
        ${article.conclusionHtml}
      `);
    } catch (error) {
      res.status(404).send("Article not found");
    }
  });

  app.listen(port, () => {
    console.log(`Preview server running at http://localhost:${port}`);
  });
}

startPreviewServer();
