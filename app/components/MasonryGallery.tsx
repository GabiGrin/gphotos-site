"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { Photo } from "@/types/gphotos";
import { calculateImageDimensions } from "@/utils/image-sizing";

const DESKTOP_BREAKPOINT = 768; // Define the breakpoint for desktop screens
const THUMBNAIL_WIDTH = 500; // Same as in process-gphotos-image.ts
const CHUNK_SIZE = 12; // Number of images to group together for height optimization

export default function MasonryGallery({
  images,
  maxColumns,
}: {
  images: Photo[];
  maxColumns: number;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [isDesktop, setIsDesktop] = useState(false);
  const [preloadedImages, setPreloadedImages] = useState<Set<number>>(
    new Set()
  );
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= DESKTOP_BREAKPOINT);
    };

    checkIsDesktop();
    window.addEventListener("resize", checkIsDesktop);

    return () => window.removeEventListener("resize", checkIsDesktop);
  }, []);

  const openLightbox = useCallback(
    (index: number) => {
      if (isDesktop) {
        setLightboxIndex(index);
      }
    },
    [isDesktop]
  );

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const moveNext = useCallback(() => {
    setLightboxIndex((prevIndex) =>
      prevIndex !== null ? (prevIndex + 1) % images.length : null
    );
  }, [images.length]);

  const movePrev = useCallback(() => {
    setLightboxIndex((prevIndex) =>
      prevIndex !== null
        ? (prevIndex - 1 + images.length) % images.length
        : null
    );
  }, [images.length]);

  const handleImageLoad = useCallback((index: number) => {
    setLoadedImages((prev) => new Set(prev).add(index));
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (lightboxIndex === null) return;

      switch (event.key) {
        case "ArrowRight":
          moveNext();
          break;
        case "ArrowLeft":
          movePrev();
          break;
        case "Escape":
          closeLightbox();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, moveNext, movePrev, closeLightbox]);

  const preloadImage = useCallback(
    (index: number) => {
      if (preloadedImages.has(index)) return;

      const img = new Image();
      img.src = images[index].imageUrl;
      img.onload = () => {
        setPreloadedImages((prev) => new Set(prev).add(index));
        setLoadedImages((prev) => new Set(prev).add(index));
      };
    },
    [images, preloadedImages]
  );

  useEffect(() => {
    if (lightboxIndex === null) return;

    // Preload next 2 images
    const next1 = (lightboxIndex + 1) % images.length;

    // Preload previous 2 images
    const prev1 = (lightboxIndex - 1 + images.length) % images.length;

    [next1, prev1].forEach(preloadImage);
  }, [lightboxIndex, images.length, preloadImage]);

  useEffect(() => {
    if (hoveredIndex === null) return;
    preloadImage(hoveredIndex);
  }, [hoveredIndex, preloadImage]);

  const getThumbnailDimensions = useCallback((image: Photo) => {
    return calculateImageDimensions({
      originalWidth: image.width ?? 0,
      originalHeight: image.height ?? 0,
      maxWidth: THUMBNAIL_WIDTH,
      maxHeight: THUMBNAIL_WIDTH, // Using same value for simplicity
    });
  }, []);

  // Add this new function to sort and distribute images
  const getOptimizedImageOrder = useCallback(
    (images: Photo[]) => {
      // Split images into chunks while preserving their original order
      const chunks: number[][] = [];
      for (let i = 0; i < images.length; i += CHUNK_SIZE) {
        const chunk = images
          .slice(i, i + CHUNK_SIZE)
          .map((_, index) => i + index);

        // Calculate height ratios for images in this chunk
        const chunkWithRatios = chunk.map((index) => ({
          index,
          heightRatio: (images[index].height ?? 1) / (images[index].width ?? 1),
        }));

        // Sort chunk by height ratio (tallest first)
        chunkWithRatios.sort((a, b) => b.heightRatio - a.heightRatio);

        // Distribute chunk in zigzag pattern
        const columns = Math.min(maxColumns, 3);
        const optimizedChunk: number[] = [];

        // Forward pass within chunk
        for (let j = 0; j < chunkWithRatios.length; j += columns) {
          for (let k = 0; k < columns && j + k < chunkWithRatios.length; k++) {
            optimizedChunk.push(chunkWithRatios[j + k].index);
          }
        }

        chunks.push(optimizedChunk);
      }

      // Flatten chunks back into a single array
      return chunks.flat();
    },
    [maxColumns]
  );

  // Get optimized image order
  const optimizedOrder = useMemo(
    () => getOptimizedImageOrder(images),
    [images, getOptimizedImageOrder]
  );

  return (
    <>
      <ResponsiveMasonry
        columnsCountBreakPoints={{
          350: Math.min(maxColumns, 2),
          750: Math.min(maxColumns, 2),
          900: Math.min(maxColumns, 3),
        }}
        className="w-full masonry-gallery"
      >
        <Masonry gutter="4px">
          {optimizedOrder.map((originalIndex) => {
            const image = images[originalIndex];
            const dimensions = getThumbnailDimensions(image);
            const aspectRatio = dimensions.width / dimensions.height;

            return (
              <div
                key={image.id}
                className="relative bg-gray-100 overflow-hidden border border-gray-200"
                style={{
                  paddingBottom: `${(1 / aspectRatio) * 100}%`,
                }}
              >
                <img
                  style={{ verticalAlign: "bottom" }}
                  src={image.thumbnailUrl}
                  alt={image.thumbnailUrl}
                  className={`absolute inset-0 w-full h-full object-cover cursor-pointer transition-all duration-200 [.masonry-gallery:has(&:hover)_&:not(:hover)]:brightness-75 ${
                    loadedImages.has(originalIndex)
                      ? "opacity-100"
                      : "opacity-0"
                  }`}
                  onClick={() => openLightbox(originalIndex)}
                  onMouseEnter={() => setHoveredIndex(originalIndex)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onLoad={() => handleImageLoad(originalIndex)}
                  loading="lazy"
                />
              </div>
            );
          })}
        </Masonry>
      </ResponsiveMasonry>

      {isDesktop && lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
          <button
            className="absolute top-4 right-4 text-white text-2xl"
            onClick={closeLightbox}
          >
            &times;
          </button>
          <button
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-4xl"
            onClick={movePrev}
          >
            &#8249;
          </button>
          <div className="relative">
            <img
              src={images[lightboxIndex].thumbnailUrl}
              alt={images[lightboxIndex].thumbnailUrl}
              className={`h-[90vh] max-w-[90vw] object-contain ${
                loadedImages.has(lightboxIndex) ? "hidden" : ""
              }`}
            />
            <img
              src={images[lightboxIndex].imageUrl}
              alt={images[lightboxIndex].imageUrl}
              className={`h-[90vh] max-w-[90vw] object-contain ${
                loadedImages.has(lightboxIndex) ? "" : "hidden"
              }`}
              onLoad={() => handleImageLoad(lightboxIndex)}
            />
          </div>
          <button
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-4xl"
            onClick={moveNext}
          >
            &#8250;
          </button>
        </div>
      )}
    </>
  );
}
