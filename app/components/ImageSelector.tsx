import { Photo } from "@/types/gphotos";
import Image from "next/image";

interface ImageSelectorProps {
  images: Photo[];
  selectedImageId: string;
  onSelect: (id: string) => void;
  selectedImageRef?: React.RefObject<HTMLDivElement>;
}

export default function ImageSelector({
  images,
  selectedImageId,
  onSelect,
  selectedImageRef,
}: ImageSelectorProps) {
  return (
    <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto p-2 border rounded-md">
      {images.map((image) => (
        <div
          key={image.id}
          ref={image.id === selectedImageId ? selectedImageRef : null}
          className={`relative aspect-square cursor-pointer rounded-md overflow-hidden ${
            image.id === selectedImageId ? "ring-2 ring-blue-500" : ""
          }`}
          onClick={() => onSelect(image.id)}
        >
          <img
            src={image.thumbnailUrl}
            alt={image.imageUrl || "Image thumbnail"}
            className="object-cover w-full h-full"
          />
        </div>
      ))}
    </div>
  );
}
