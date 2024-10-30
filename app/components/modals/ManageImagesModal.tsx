import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Photo, ProcessedImage } from "@/types/gphotos";

import { useState } from "react";
import { deleteImages } from "@/app/actions/images";
import { useToast } from "@/hooks/use-toast";
import { ImportImagesModal } from "./ImportImagesModal";

interface ManageImagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: Photo[];
  onImagesDeleted: () => void;
  onImportImages: () => void;
}

export function ManageImagesModal({
  isOpen,
  onClose,
  photos,
  onImagesDeleted,
  onImportImages,
}: ManageImagesModalProps) {
  const { toast } = useToast();
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotos((current) =>
      current.includes(photoId)
        ? current.filter((id) => id !== photoId)
        : [...current, photoId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedPhotos.length === photos.length) {
      setSelectedPhotos([]);
    } else {
      setSelectedPhotos(photos.map((photo) => photo.id));
    }
  };

  const handleDelete = async () => {
    if (!selectedPhotos.length) return;

    const result = await deleteImages(selectedPhotos);
    if (result.success) {
      setSelectedPhotos([]);
      onImagesDeleted?.();
      toast({
        title: "Success",
        description: `${selectedPhotos.length} image${selectedPhotos.length > 1 ? "s" : ""} deleted successfully`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete images",
        variant: "destructive",
      });
      console.error("Failed to delete photos:", result.error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Manage Images
            {photos.length > 0 && (
              <span className="text-sm text-gray-500 ml-2">
                ({selectedPhotos.length} of {photos.length} selected)
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 min-h-0">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button variant="secondary" onClick={onImportImages}>
                Import more
              </Button>
              <button className="main-btn" onClick={toggleSelectAll}>
                {selectedPhotos.length === photos.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>
            {selectedPhotos.length > 0 && (
              <Button variant="destructive" onClick={handleDelete} size="sm">
                Delete selected ({selectedPhotos.length})
              </Button>
            )}
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="flex flex-wrap gap-1 content-start">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className={`relative cursor-pointer w-[70px] h-[70px] group ${
                    selectedPhotos.includes(photo.id)
                      ? "outline outline-2 outline-blue-500"
                      : ""
                  }`}
                  onClick={() => togglePhotoSelection(photo.id)}
                >
                  <img
                    src={photo.thumbnailUrl}
                    alt={photo.id}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  {selectedPhotos.includes(photo.id) && (
                    <div className="absolute inset-0 bg-blue-500 bg-opacity-20 rounded-lg" />
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-[8px] p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    {new Date(photo.imported_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
