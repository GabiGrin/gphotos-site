import fs from "fs/promises";
import path from "path";

async function fixJsonImageCasing() {
  // Get all JSON files in articles directory
  const articlesDir = path.join(process.cwd(), "articles");
  const jsonFiles = (await fs.readdir(articlesDir))
    .filter((file) => file.endsWith(".json"))
    .map((file) => path.join(articlesDir, file));

  // Get all image files in public/images
  const imagesDir = path.join(process.cwd(), "public/images");
  const imageFiles = await fs.readdir(imagesDir);

  // Process each JSON file
  for (const jsonFile of jsonFiles) {
    const content = await fs.readFile(jsonFile, "utf-8");
    const data = JSON.parse(content);

    // Skip if no images array
    if (!Array.isArray(data.images)) continue;

    // Fix image paths based on actual files
    const fixedImages = data.images.map((imagePath: string) => {
      const fileName = path.basename(imagePath);

      // Find matching image with case-insensitive comparison
      const actualFile = imageFiles.find(
        (file) => file.toLowerCase() === fileName.toLowerCase()
      );

      if (!actualFile) {
        console.log(`No matching image found for ${fileName}`);
        return imagePath;
      }

      console.log(`Found matching image for ${fileName}: ${actualFile}`);

      // Replace just the filename portion while keeping the URL path
      return imagePath.replace(fileName, actualFile);
    });

    // Only update if changes were made
    if (JSON.stringify(fixedImages) !== JSON.stringify(data.images)) {
      data.images = fixedImages;
      await fs.writeFile(jsonFile, JSON.stringify(data, null, 2));
      console.log(`Updated image paths in ${path.basename(jsonFile)}`);
    } else {
      console.log(`No changes needed for ${path.basename(jsonFile)}`);
    }
  }
}

fixJsonImageCasing().catch(console.error);
