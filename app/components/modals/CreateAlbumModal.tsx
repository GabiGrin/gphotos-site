import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Photo } from "@/types/gphotos";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageIcon, X } from "lucide-react";

interface CreateAlbumModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    title: string;
    description: string;
    coverImageId: string;
  }) => Promise<void>;
  images: Photo[];
}

export default function CreateAlbumModal({
  open,
  onOpenChange,
  onSubmit,
  images,
}: CreateAlbumModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImageId, setCoverImageId] = useState<string>("");
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !coverImageId) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ title, description, coverImageId });
      onOpenChange(false);
      // Reset form
      setTitle("");
      setDescription("");
      setCoverImageId("");
    } catch (error) {
      console.error("Failed to create album:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedImage = images.find((img) => img.id === coverImageId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create New Album</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-6">
            {/* Left side - Title and Description */}
            <div className="flex-1 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Album Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter album title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter album description"
                  rows={3}
                />
              </div>
            </div>

            {/* Right side - Cover Image */}
            <div className="w-[178px]">
              <Label>Cover Image</Label>
              {!coverImageId ? (
                <button
                  type="button"
                  onClick={() => setShowImagePicker(true)}
                  className="w-[178px] h-[178px] mt-2 border-2 border-dashed rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                >
                  <ImageIcon className="w-6 h-6 text-gray-400" />
                  <span className="text-gray-600">Select image</span>
                </button>
              ) : (
                <div className="relative mt-2">
                  <img
                    src={selectedImage?.thumbnailUrl}
                    alt="Cover"
                    className="w-[178px] h-[178px] object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setCoverImageId("")}
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {showImagePicker && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Select Cover Image</h3>
                  <button
                    type="button"
                    onClick={() => setShowImagePicker(false)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {images.map((image) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => {
                        setCoverImageId(image.id);
                        setShowImagePicker(false);
                      }}
                      className={`relative aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all ${
                        coverImageId === image.id ? "ring-2 ring-blue-500" : ""
                      }`}
                    >
                      <img
                        src={image.thumbnailUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="main-btn !bg-gray-100 hover:!bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title || !coverImageId}
              className={`main-btn !bg-blue-500 text-white ${
                isSubmitting || !title || !coverImageId
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {isSubmitting ? "Creating..." : "Create Album"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
