import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Photo, Album, Site } from "@/types/gphotos";

import { useEffect, useMemo, useState } from "react";
import { deleteImages } from "@/app/actions/images";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangleIcon, Check } from "lucide-react";
import { usePremiumLimits } from "@/hooks/use-premium-limits";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { InfoIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ImageIcon } from "lucide-react";

interface ManageImagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: Photo[];
  albums: Album[];
  onImagesDeleted: () => void;
  onImportImages: () => void;
  onAssignToAlbum: (photoIds: string[], albumId: string) => Promise<void>;
  userId: string;
  site: Site;
}

const THUMBNAIL_SIZES = {
  medium: {
    label: "Medium",
    size: 120,
  },
  large: {
    label: "Large",
    size: 180,
  },
} as const;

type ThumbnailSize = keyof typeof THUMBNAIL_SIZES;

type FilterOption = "all" | "unassigned" | string; // string is for album IDs

export function ManageImagesModal({
  isOpen,
  onClose,
  photos,
  albums,
  onImagesDeleted,
  onImportImages,
  onAssignToAlbum,
  userId,
  site,
}: ManageImagesModalProps) {
  const { toast } = useToast();
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [thumbnailSize, setThumbnailSize] = useState<ThumbnailSize>("medium");
  const [isAssigning, setIsAssigning] = useState(false);
  const [filterOption, setFilterOption] = useState<FilterOption>("all");

  const combinedPremiumData = usePremiumLimits(site);
  const { photoLimit } = combinedPremiumData;
  const remainingPhotos = photoLimit - photos.length;

  useEffect(() => {
    if (isOpen) {
      setSelectedPhotos([]);
    }
  }, [isOpen]);

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

    setIsDeleting(true);
    try {
      const result = await deleteImages(userId, selectedPhotos);
      if (result.success) {
        setSelectedPhotos([]);
        onImagesDeleted?.();
        toast({
          title: "Success",
          description: `${selectedPhotos.length} image${selectedPhotos.length > 1 ? "s" : ""} deleted successfully`,
        });

        if (selectedPhotos.length === photos.length) {
          onClose();
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to delete images",
          variant: "destructive",
        });
        console.error("Failed to delete photos:", result.error);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAssignToAlbum = async (albumId: string) => {
    if (!selectedPhotos.length) return;

    setIsAssigning(true);
    try {
      await onAssignToAlbum(selectedPhotos, albumId);
      toast({
        title: "Success",
        description: `${selectedPhotos.length} image${
          selectedPhotos.length > 1 ? "s" : ""
        } assigned to album`,
      });
      setSelectedPhotos([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign images to album",
        variant: "destructive",
      });
      console.error("Failed to assign images to album:", error);
    } finally {
      setIsAssigning(false);
    }
  };

  const filteredPhotos = useMemo(() => {
    switch (filterOption) {
      case "all":
        return photos;
      case "unassigned":
        return photos.filter((photo) => !photo.album_id);
      default:
        return photos.filter((photo) => photo.album_id === filterOption);
    }
  }, [photos, filterOption]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl h-[80vh] flex flex-col p-4"
        onPointerDownOutside={(e) =>
          selectedPhotos.length > 0 && e.preventDefault()
        }
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 justify-between pr-12">
            Manage Images{" "}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">View:</span>
              <Select
                value={thumbnailSize}
                onValueChange={(value: ThumbnailSize) =>
                  setThumbnailSize(value)
                }
              >
                <SelectTrigger className="w-[100px]" size="sm">
                  <SelectValue placeholder="Size" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(THUMBNAIL_SIZES).map(([key, { label }]) => (
                    <SelectItem key={key} value={key} className="text-sm">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 flex-1 min-h-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {/* View Controls */}

              {/* Filter Controls */}
              {albums.length > 0 && (
                <div className="flex items-center gap-2 border-l pl-4">
                  <span className="text-sm text-muted-foreground">Filter:</span>
                  <Select
                    value={filterOption}
                    onValueChange={(value) => setFilterOption(value)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter images" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Images</SelectItem>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {albums.map((album) => (
                        <SelectItem key={album.id} value={album.id}>
                          {album.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto">
            {filteredPhotos.length > 0 ? (
              <div
                className="grid gap-2 content-start auto-rows-auto"
                style={{
                  gridTemplateColumns: `repeat(auto-fill, minmax(${THUMBNAIL_SIZES[thumbnailSize].size}px, 1fr))`,
                }}
              >
                {filteredPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className={`relative cursor-pointer group aspect-square ${
                      selectedPhotos.includes(photo.id)
                        ? "ring-2 ring-blue-500"
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
                      <>
                        <div className="absolute inset-0 bg-blue-500 bg-opacity-20 rounded-lg" />
                        <div className="absolute top-2 right-2 bg-blue-500 rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                          <Check className="w-3 h-3 text-white stroke-[3]" />
                        </div>
                      </>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-1.5 rounded-b-lg flex flex-col gap-0.5">
                      <span className="text-gray-300">
                        {new Date(
                          photo.gphotos_created_at
                        ).toLocaleDateString()}
                      </span>
                      {albums.length > 0 && (
                        <span className="text-white flex items-center gap-1">
                          {photo.album_id ? (
                            `${albums.find((a) => a.id === photo.album_id)?.title || "Unknown"}`
                          ) : (
                            <>
                              <i>Unassigned</i>
                              <TooltipProvider delayDuration={100}>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <AlertTriangleIcon className="w-3 h-3" />
                                  </TooltipTrigger>
                                  <TooltipContent sideOffset={5}>
                                    <p>
                                      This image won't be visible until it's
                                      assigned to an album
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <ImageIcon className="w-12 h-12 mb-4 opacity-50" />
                {photos.length === 0 ? (
                  <>
                    <p className="text-lg font-medium mb-2">No photos yet</p>
                    <p className="text-sm">Import some photos to get started</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-medium mb-2">No photos found</p>
                    <p className="text-sm">Try changing your filter settings</p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Updated Footer */}
          <div className="border-t pt-4 mt-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Button variant="default" onClick={toggleSelectAll}>
                {selectedPhotos.length === filteredPhotos.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
              <span className="text-sm text-muted-foreground">
                {selectedPhotos.length} selected
              </span>
            </div>

            {selectedPhotos.length > 0 ? (
              <div className="flex items-center gap-2">
                {albums.length > 0 && (
                  <Select
                    disabled={isAssigning}
                    onValueChange={handleAssignToAlbum}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Assign to album..." />
                    </SelectTrigger>
                    <SelectContent>
                      {albums.map((album) => (
                        <SelectItem key={album.id} value={album.id}>
                          {album.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting
                    ? "Deleting..."
                    : `Delete selected (${selectedPhotos.length})`}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="default"
                  onClick={onImportImages}
                  disabled={remainingPhotos <= 0}
                  title={
                    remainingPhotos <= 0
                      ? "Photo limit reached"
                      : "Import photos"
                  }
                >
                  Import More Photos
                </Button>
                <span className="text-sm text-muted-foreground">
                  {photos.length} / {photoLimit} photos used
                  {remainingPhotos <= 0 && (
                    <span className="text-red-500 ml-2">Limit reached</span>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
