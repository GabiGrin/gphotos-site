"use client";

import React, { useState, useCallback, useEffect } from "react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { Photo, ProcessedImage } from "@/types/gphotos";

const DESKTOP_BREAKPOINT = 768; // Define the breakpoint for desktop screens

export default function MasonryGallery({ images }: { images: Photo[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [isDesktop, setIsDesktop] = useState(false);

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

  return (
    <>
      <ResponsiveMasonry
        columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}
        className="w-full"
      >
        <Masonry gutter="2px">
          {images.map((image, index) => (
            <img
              key={image.id}
              src={image.thumbnailUrl}
              alt={image.thumbnailUrl}
              className="w-full cursor-pointer"
              onClick={() => openLightbox(index)}
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
