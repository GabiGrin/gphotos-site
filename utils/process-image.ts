import { createServiceClient } from "@/utils/supabase/service";
import { createServerApi } from "@/utils/server-api";
import { getGPhotosClient } from "@/utils/gphotos";
import { createThumbnail } from "@/utils/create-thumbnail";
import logger from "@/utils/logger";
import { MediaItem } from "@/types/google-photos";

export async function processImage({
  userId,
  mediaItem,
  googleAccessToken,
}: {
  userId: string;
  mediaItem: MediaItem;
  googleAccessToken: string;
}): Promise<{
  processedImageId: string;
  imagePublicUrl: string;
  thumbnailPublicUrl: string;
}> {
  const client = createServiceClient();
  const serverApi = createServerApi(client);
  const { getImage } = getGPhotosClient();

  try {
    logger.info(
      { userId, mediaItemId: mediaItem.id },
      "Fetching image from Google Photos"
    );
    const imageBlob = await getImage({
      token: googleAccessToken,
      baseUrl: mediaItem.mediaFile.baseUrl,
      width: mediaItem.mediaFile.mediaFileMetadata.width,
      height: mediaItem.mediaFile.mediaFileMetadata.height,
    });

    logger.info(
      { userId, mediaItemId: mediaItem.id },
      "Image fetched, preparing for upload"
    );

    // Upload the image to Supabase storage
    const { data, error } = await client.storage
      .from("images")
      .upload(`${userId}/${mediaItem.mediaFile.filename}`, imageBlob, {
        contentType: mediaItem.mediaFile.mimeType,
      });
    if (error) throw error;
    if (!data) throw new Error("No data returned from storage");

    // Generate and upload thumbnail
    const thumbnailBlob = await createThumbnail(imageBlob, 200, 200);
    const { data: thumbnailData, error: thumbnailError } = await client.storage
      .from("thumbnails")
      .upload(
        `${userId}/thumb_${mediaItem.mediaFile.filename}`,
        thumbnailBlob,
        {
          contentType: "image/jpeg", // Assuming we convert to JPEG for thumbnails
        }
      );

    if (thumbnailError) throw thumbnailError;
    if (!thumbnailData) throw new Error("No data returned from storage");

    logger.info(
      { userId, mediaItemId: mediaItem.id },
      "Full-size image and thumbnail uploaded successfully"
    );

    const imagePublicUrl = client.storage.from("images").getPublicUrl(data.path)
      .data.publicUrl;
    const thumbnailPublicUrl = client.storage
      .from("thumbnails")
      .getPublicUrl(thumbnailData.path).data.publicUrl;

    // Use serverApi to save processed image
    const processedImage = await serverApi.saveProcessedImage({
      userId,
      mediaItem,
      imagePath: data.path,
      thumbnailPath: thumbnailData.path,
      imagePublicUrl,
      thumbnailPublicUrl,
    });

    logger.info(
      { userId, mediaItemId: mediaItem.id },
      "Image processed and added to database"
    );

    return {
      processedImageId: processedImage.path,
      imagePublicUrl,
      thumbnailPublicUrl,
    };
  } catch (error) {
    logger.error(
      { userId, mediaItemId: mediaItem.id, error: error },
      "Error processing image upload"
    );
    throw error;
  }
}
