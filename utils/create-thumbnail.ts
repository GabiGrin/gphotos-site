import sharp from "sharp";

export async function createThumbnail(
  imageBlob: Blob,
  maxWidth: number,
  format: "jpeg" | "png" | "webp" = "webp"
): Promise<Blob> {
  const buffer = await imageBlob.arrayBuffer();
  const resizedBuffer = await sharp(buffer)
    .resize(maxWidth, undefined, { fit: "inside", withoutEnlargement: true })
    .toFormat(format)
    .toBuffer();

  return new Blob([resizedBuffer], { type: `image/${format}` });
}
