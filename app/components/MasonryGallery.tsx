"use client";

import React from "react";
import Masonry from "react-masonry-css";
import Image from "next/image";

type ProcessedImage = {
  user_id: string;
  public_url: string;
  thumbnail_url: string;
  created_at: string;
  path: string;
};

interface MasonryGalleryProps {
  images: ProcessedImage[];
}

const MasonryGallery: React.FC<MasonryGalleryProps> = ({ images }) => {
  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1,
  };

  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="flex w-auto -ml-4"
      columnClassName="pl-4 bg-clip-padding"
    >
      {images.map((image) => (
        <div key={image.path} className="mb-4">
          <img
            src={image.thumbnail_url || image.public_url}
            alt={`Processed image ${image.path}`}
            width={300}
            height={300}
            className="w-full"
          />
        </div>
      ))}
    </Masonry>
  );
};

export default MasonryGallery;
