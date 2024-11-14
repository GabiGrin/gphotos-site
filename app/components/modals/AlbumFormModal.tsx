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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { generateSlug } from "@/utils/string-utils";

interface AlbumFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    title: string;
    description: string;
    coverImageId: string;
    slug: string;
  }) => void;
  images: Photo[];
  initialData?: Album;
  mode: "create" | "edit";
  existingSlugs: string[];
}

function generateRandomString(length: number): string {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
}

async function generateUniqueSlug(
  title: string,
  existingSlugs: string[]
): Promise<string> {
  let slug = generateSlug(title);
  let isUnique = !existingSlugs.includes(slug);

  while (!isUnique) {
    const randomSuffix = generateRandomString(3);
    slug = `${generateSlug(title)}-${randomSuffix}`;
    isUnique = !existingSlugs.includes(slug);
  }

  return slug;
}

export default function AlbumFormModal({
  open,
  onOpenChange,
  onSubmit,
  images,
  initialData,
  mode,
  existingSlugs,
}: AlbumFormModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImageId, setCoverImageId] = useState("");
  const [error, setError] = useState("");
  const selectedImageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      if (mode === "edit" && initialData) {
        setTitle(initialData.title);
        setDescription(initialData.description || "");
        setCoverImageId(initialData.cover_image_id || "");
        setTimeout(() => {
          selectedImageRef.current?.scrollIntoView({ block: "nearest" });
        }, 100);
      } else {
        setTitle("");
        setDescription("");
        setCoverImageId("");
      }
      setError("");
    }
  }, [open, mode, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Please enter an album title");
      return;
    }

    if (!coverImageId) {
      setError("Please select a cover image");
      return;
    }

    const slug = await generateUniqueSlug(title, existingSlugs);

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      coverImageId,
      slug,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="shrink-0 px-6 py-4 border-b">
          <DialogTitle className="text-xl font-semibold">
            {mode === "create" ? "Create New Album" : "Edit Album"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col min-h-0 h-full gap-6">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium block">
                    Album Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Summer Vacation 2024"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="description"
                    className="text-sm font-medium block"
                  >
                    Description{" "}
                    <span className="text-gray-500">(optional)</span>
                  </label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a description for your album..."
                    className="w-full resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex flex-col flex-1 min-h-0">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium">
                      Cover Image <span className="text-red-500">*</span>
                    </label>
                    {!coverImageId && (
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <ImageIcon size={14} />
                        Select a cover image
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-h-0 border rounded-lg overflow-hidden">
                    <ImageSelector
                      images={images}
                      selectedImageId={coverImageId}
                      onSelect={setCoverImageId}
                      selectedImageRef={selectedImageRef}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="shrink-0 border-t p-4 bg-gray-50">
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="default">
                {mode === "create" ? "Create Album" : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
