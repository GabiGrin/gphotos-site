import { FullArticle } from ".";
import { Platform } from "./types";
import { GalleryType } from "./types";

const COLLECTION_ID = "6742fe1d7056cf5f111c38a3";
const API_KEY =
  "ee784e6253e8fb810522f5a92ecb1e7d28fa4fdd21a28445bfedd1193822f191";

const typeMap: Record<GalleryType, string> = {
  "Cultural Ceremony": "674320c9c83debd6b2cb3433",
  Festival: "674320bf5c5ccf9560771317",
  "Memorials and Tributes": "674320b862fef8e27a8bf796",
  "Nonprofit Campaign": "674320afe73b758b3128d1c4",
  "Holiday Celebration": "674320a57649b770d11ffe1b",
  "Sports Event": "6743209bd82d3e7ba751f166",
  "Corporate Event": "6743209562fef8e27a8be35a",
  "Baby Shower": "6743208ce73b758b3128b26a",
  Graduation: "674320855927a125f5d7251f",
  "Family Reunion": "674320331e5c164ac43f40fc",
  Birthday: "67432019284895117aa0d65c",
  Travel: "67432010cdde6507d56d66df",
  Conference: "6743200a90bd5ff57af7361b",
  Wedding: "674319a7ced71f07886ad2c6",
  Anniversary: "6743199994c5ef5aafe38e7c",
};

const platformMap: Record<Platform, string> = {
  "GoDaddy Website Builder": "674320f306e780a20b5648b5",
  Weebly: "674320e9e90e602af369970a",
  Pixieset: "674320e03bbf3144c0ed50c5",
  Zenfolio: "674320d97649b770d120312f",
  WordPress: "674320d2ecc4a01ade323259",
  Squarespace: "6743197fba3b879d97d3ab4a",
  Wix: "674319767056cf5f112e611b",
};

async function uploadArticleToWebflow(article: FullArticle) {
  if (article.uploaded) {
    return null;
  }

  const payload = {
    fieldData: {
      name: article.title,
      slug: article.slug,
      "meta-description": article.blurb,
      blurb: article.blurb,
      platform1: platformMap[article.platform],
      "gallery-type1": typeMap[article.galleryType],
      "table-of-content": article.tocHtml,
      introduction: article.introductionHtml,
      "main-content": article.mainContentHtml,
      "mps-section": article.mpsBetterSectionHtml,
      conclusion: article.conclusionHtml,
      "fact-1---average-photos": article.facts.averagePhotos,
      "fact-2--lighting": article.facts.preferredLighting,
      "fact-3---lens": article.facts.mostPopularLens,
      "fact-4---layout": article.facts.bestGalleryLayout,
      "image-1-main-url": article.images[0],
      "image-2-url": article.images[1],
    },
  };

  console.log(payload);

  try {
    const response = await fetch(
      `https://api.webflow.com/v2/collections/${COLLECTION_ID}/items`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "accept-version": "1.0.0",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      console.log(await response.json());
      throw new Error(`Failed to upload article: ${article.slug}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error uploading article ${article.slug}:`, error);
    throw error;
  }
}

export { uploadArticleToWebflow };
