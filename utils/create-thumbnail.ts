import sharp from "sharp";

export async function createThumbnail(
  imageBlob: Blob,
  width: number,
  height: number
): Promise<Blob> {
  const buffer = await imageBlob.arrayBuffer();
  const resizedBuffer = await sharp(buffer)
    .resize(width, height, { fit: "cover" })
    .toFormat("jpeg")
    .toBuffer();

  return new Blob([resizedBuffer], { type: "image/jpeg" });
}
