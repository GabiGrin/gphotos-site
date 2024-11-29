import { createServiceClient } from "@/utils/supabase/service";
import { createServerApi } from "@/utils/dal/server-api";
import { getGPhotosClient } from "@/utils/gphotos";
import { createThumbnail } from "@/utils/create-thumbnail";
import logger from "@/utils/logger";
import { MediaItem } from "@/types/google-photos";
import { calculateImageDimensions } from "@/utils/image-sizing";

const maxWidth = 2048;
const maxHeight = 2048;
const thumbnailWidth = 500;

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .replace(/_{2,}/g, "_")
    .toLowerCase();
}

export async function processGPhotosImage({
  userId,
  sessionId,
  mediaItem,
  googleAccessToken,
}: {
  userId: string;
  sessionId: string;
  mediaItem: MediaItem;
  googleAccessToken: string;
  thumbnailWidth: number;
}): Promise<{
  processedImageId: string;
  imagePublicUrl: string;
  thumbnailPublicUrl: string;
}> {
  const client = createServiceClient();
  const serverApi = createServerApi(client);
  const { getImage } = getGPhotosClient();

  try {
    const originalWidth = mediaItem.mediaFile.mediaFileMetadata.width;
    const originalHeight = mediaItem.mediaFile.mediaFileMetadata.height;

    const { width: requestedWidth, height: requestedHeight } =
      calculateImageDimensions({
        originalWidth,
        originalHeight,
        maxWidth,
        maxHeight,
      });

    logger.info(
      { userId, mediaItemId: mediaItem.id, requestedWidth, requestedHeight },
      "Fetching image from Google Photos"
    );
    const imageBlob = await getImage({
      token: googleAccessToken,
      baseUrl: mediaItem.mediaFile.baseUrl,
      width: requestedWidth,
      height: requestedHeight,
    });

    logger.info(
      { userId, mediaItemId: mediaItem.id },
      "Image fetched, preparing for upload"
    );

    const sanitizedFilename = sanitizeFilename(mediaItem.mediaFile.filename);

    // Upload the image to Supabase storage
    const { data, error } = await client.storage
      .from("images")
      .upload(`${userId}/${sessionId}/${sanitizedFilename}`, imageBlob, {
        contentType: mediaItem.mediaFile.mimeType,
      });
    if (error) throw error;
    if (!data) throw new Error("No data returned from storage");

    // Generate and upload thumbnail
    const thumbnailBlob = await createThumbnail(imageBlob, thumbnailWidth);
    const { data: thumbnailData, error: thumbnailError } = await client.storage
      .from("thumbnails")
      .upload(
        `${userId}/${sessionId}/thumb_${sanitizedFilename}`,
        thumbnailBlob,
        {
          contentType: "image/jpeg",
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
    });

    logger.info(
      { userId, mediaItemId: mediaItem.id },
      "Image processed and added to database"
    );

    return {
      processedImageId: processedImage.id,
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
