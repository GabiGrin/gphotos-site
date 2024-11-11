"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Photo } from "@/types/gphotos";
import { calculateImageDimensions } from "@/utils/image-sizing";
import { Masonry } from "./Masonry/Masonry";

const MOBILE_BREAKPOINT = 350; // For phones
const TABLET_BREAKPOINT = 750; // For tablets
const DESKTOP_BREAKPOINT = 900; // Existing desktop breakpoint
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
  const [columnCount, setColumnCount] = useState(maxColumns);

  useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth;
      setIsDesktop(width >= DESKTOP_BREAKPOINT);

      // Update column count based on screen width
      if (width < MOBILE_BREAKPOINT) {
        setColumnCount(Math.min(maxColumns, 2));
      } else if (width < TABLET_BREAKPOINT) {
        setColumnCount(Math.min(maxColumns, 2));
      } else if (width < DESKTOP_BREAKPOINT) {
        setColumnCount(Math.min(maxColumns, 2));
      } else {
        setColumnCount(Math.min(maxColumns, 3));
      }
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);

    return () => window.removeEventListener("resize", updateLayout);
  }, [maxColumns]);

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

  const galleryItems = images.map((image, originalIndex) => {
    const dimensions = getThumbnailDimensions(image);
    const aspectRatio = dimensions.width / dimensions.height;

    const element = (
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
            loadedImages.has(originalIndex) ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => openLightbox(originalIndex)}
          onMouseEnter={() => setHoveredIndex(originalIndex)}
          onMouseLeave={() => setHoveredIndex(null)}
          onLoad={() => handleImageLoad(originalIndex)}
          loading="lazy"
        />
      </div>
    );

    return { element, size: dimensions };
  });

  return (
    <>
      <Masonry
        gutter={4}
        className="w-full"
        items={galleryItems}
        columns={columnCount}
      />

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
