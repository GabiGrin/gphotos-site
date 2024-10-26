"use client";

import React from "react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { ProcessedImage } from "@/types/gphotos";

export default function MasonryGallery({
  images,
}: {
  images: ProcessedImage[];
}) {
  return (
    <ResponsiveMasonry
      columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}
      className="w-full"
    >
      <Masonry gutter="2px">
        {images.map((image) => (
          <img
            key={image.id}
            src={image.public_url}
            alt={image.public_url}
            className="w-full"
          />
        ))}
      </Masonry>
    </ResponsiveMasonry>
  );
}
