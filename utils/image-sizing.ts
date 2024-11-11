export function calculateImageDimensions({
  originalWidth,
  originalHeight,
  maxWidth,
  maxHeight,
}: {
  originalWidth: number;
  originalHeight: number;
  maxWidth: number;
  maxHeight: number;
}) {
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

  return {
    width: requestedWidth,
    height: requestedHeight,
  };
}
