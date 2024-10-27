import { createServiceClient } from "@/utils/supabase/service";
import { createServerApi } from "@/utils/server-api";
import { getGPhotosClient } from "@/utils/gphotos";
import { createThumbnail } from "@/utils/create-thumbnail";
import logger from "@/utils/logger";
import { MediaItem } from "@/types/google-photos";

const maxWidth = 2048;
const maxHeight = 2048;
const thumbnailWidth = 500;

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
    // Calculate reasonable max dimensions for the image

    const originalWidth = mediaItem.mediaFile.mediaFileMetadata.width;
    const originalHeight = mediaItem.mediaFile.mediaFileMetadata.height;
    const aspectRatio = originalWidth / originalHeight;

    let requestedWidth, requestedHeight;

    if (aspectRatio > 1) {
      // Landscape orientation
      requestedWidth = Math.min(maxWidth, originalWidth);
      requestedHeight = Math.round(requestedWidth / aspectRatio);
    } else {
      // Portrait orientation
      requestedHeight = Math.min(maxHeight, originalHeight);
      requestedWidth = Math.round(requestedHeight * aspectRatio);
    }

    // Ensure both dimensions are within limits
    if (requestedWidth > maxWidth) {
      requestedWidth = maxWidth;
      requestedHeight = Math.round(maxWidth / aspectRatio);
    }
    if (requestedHeight > maxHeight) {
      requestedHeight = maxHeight;
      requestedWidth = Math.round(maxHeight * aspectRatio);
    }

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

    // Upload the image to Supabase storage
    const { data, error } = await client.storage
      .from("images")
      .upload(
        `${userId}/${sessionId}/${mediaItem.mediaFile.filename}`,
        imageBlob,
        {
          contentType: mediaItem.mediaFile.mimeType,
        }
      );
    if (error) throw error;
    if (!data) throw new Error("No data returned from storage");

    // Generate and upload thumbnail
    const thumbnailBlob = await createThumbnail(imageBlob, thumbnailWidth);
    const { data: thumbnailData, error: thumbnailError } = await client.storage
      .from("thumbnails")
      .upload(
        `${userId}/${sessionId}/thumb_${mediaItem.mediaFile.filename}`,
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