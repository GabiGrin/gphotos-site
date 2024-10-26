import sharp from "sharp";

export async function createThumbnail(
  imageBlob: Blob,
  maxWidth: number,
  maxHeight: number,
  format: "jpeg" | "png" | "webp" = "webp"
): Promise<Blob> {
  const buffer = await imageBlob.arrayBuffer();
  const resizedBuffer = await sharp(buffer)
    .resize(maxWidth, maxHeight, { fit: "inside", withoutEnlargement: true })
    .toFormat(format)
    .toBuffer();

  return new Blob([resizedBuffer], { type: `image/${format}` });
}
