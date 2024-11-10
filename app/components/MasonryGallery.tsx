"use client";

import React, { useState, useCallback, useEffect } from "react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { Photo, ProcessedImage } from "@/types/gphotos";

const DESKTOP_BREAKPOINT = 768; // Define the breakpoint for desktop screens

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
          {images.map((image, index) => (
            <img
              key={image.id}
              src={image.thumbnailUrl}
              alt={image.thumbnailUrl}
              className="w-full cursor-pointer transition-all duration-200 [.masonry-gallery:has(&:hover)_&:not(:hover)]:brightness-75"
              onClick={() => openLightbox(index)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              loading="lazy"
            />
          ))}
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
