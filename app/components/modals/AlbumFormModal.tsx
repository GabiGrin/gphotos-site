"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Album, Photo } from "@/types/gphotos";
import { useEffect, useState, useRef } from "react";
import ImageSelector from "../ImageSelector";

interface AlbumFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    title: string;
    description: string;
    coverImageId: string;
  }) => void;
  images: Photo[];
  initialData?: Album;
  mode: "create" | "edit";
}

export default function AlbumFormModal({
  open,
  onOpenChange,
  onSubmit,
  images,
  initialData,
  mode,
}: AlbumFormModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImageId, setCoverImageId] = useState("");

  // Add ref for the selected image
  const selectedImageRef = useRef<HTMLDivElement>(null);

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (open) {
      if (mode === "edit" && initialData) {
        setTitle(initialData.title);
        setDescription(initialData.description || "");
        setCoverImageId(initialData.cover_image_id || "");

        // Add small delay to ensure the DOM is ready
        setTimeout(() => {
          selectedImageRef.current?.scrollIntoView({
            block: "nearest",
          });
        }, 100);
      } else {
        // Reset form for create mode
        setTitle("");
        setDescription("");
        setCoverImageId("");
      }
    }
  }, [open, mode, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      coverImageId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[90vh] p-0">
        <DialogHeader className="p-6 py-4">
          <DialogTitle>
            {mode === "create" ? "Create Album" : "Edit Album"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="flex-1 overflow-y-auto px-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter album title"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter album description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Cover Image</label>
                <ImageSelector
                  images={images}
                  selectedImageId={coverImageId}
                  onSelect={setCoverImageId}
                  selectedImageRef={selectedImageRef}
                />
              </div>
            </div>
          </div>

          <div className="border-t p-6 mt-auto">
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 border rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
              >
                {mode === "create" ? "Create" : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
