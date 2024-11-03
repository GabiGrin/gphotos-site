"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Album, Photo, ProcessedImage } from "@/types/gphotos";
import { useState, useEffect } from "react";
import Image from "next/image";
import { PlusIcon, Trash, Pencil, FolderIcon } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import AlbumFormModal from "./AlbumFormModal";
import { createClientApi } from "@/utils/dal/client-api";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ManageAlbumsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: Photo[];
  userId: string;
}

export default function ManageAlbumsModal({
  open,
  onOpenChange,
  images,
  userId,
}: ManageAlbumsModalProps) {
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [albumToDelete, setAlbumToDelete] = useState<Album | null>(null);

  const supabase = createClient();
  const clientApi = createClientApi(supabase);

  const [albums, setAlbums] = useState<Album[]>([]);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const albums = await clientApi.getAlbums(userId);

        setAlbums(albums);
      } catch (error) {
        console.error("Error fetching albums:", error);
        toast({
          variant: "destructive",
          description: "Failed to load albums. Please try again.",
        });
      }
    };

    if (open) {
      fetchAlbums();
    }
  }, [open, userId, clientApi]);

  const getCoverImage = (imageId: string) => {
    return images.find((img) => img.id === imageId);
  };

  const validateAlbumData = (data: {
    title: string;
    description: string;
    coverImageId: string;
  }) => {
    if (!data.title?.trim()) {
      toast({
        variant: "destructive",
        description: "Please enter an album title",
      });
      return false;
    }
    if (!data.description?.trim()) {
      toast({
        variant: "destructive",
        description: "Please enter an album description",
      });
      return false;
    }
    if (!data.coverImageId) {
      toast({
        variant: "destructive",
        description: "Please select a cover image",
      });
      return false;
    }
    return true;
  };

  const handleCreateAlbum = async (data: {
    title: string;
    description: string;
    coverImageId: string;
  }) => {
    if (!validateAlbumData(data)) return;

    try {
      const newAlbum = await clientApi.createAlbum({
        title: data.title.trim(),
        description: data.description.trim(),
        cover_image_id: data.coverImageId,
        user_id: userId,
      });

      setAlbums((prevAlbums) => [...prevAlbums, newAlbum]);
      setShowAlbumModal(false);
      toast({
        description: "Album created successfully",
      });
    } catch (error) {
      console.error("Error creating album:", error);
      toast({
        variant: "destructive",
        description: "Failed to create album. Please try again.",
      });
    }
  };

  const handleEditAlbum = async (data: {
    title: string;
    description: string;
    coverImageId: string;
  }) => {
    if (!validateAlbumData(data)) return;
    if (!selectedAlbum) return;

    try {
      const updatedAlbum = await clientApi.updateAlbum(selectedAlbum.id, {
        title: data.title.trim(),
        description: data.description.trim(),
        cover_image_id: data.coverImageId,
      });

      setAlbums((prevAlbums) =>
        prevAlbums.map((album) =>
          album.id === updatedAlbum.id ? updatedAlbum : album
        )
      );

      setShowAlbumModal(false);
      toast({
        description: "Album updated successfully",
      });
    } catch (error) {
      console.error("Error updating album:", error);
      toast({
        variant: "destructive",
        description: "Failed to update album. Please try again.",
      });
    }
  };

  const handleDeleteAlbum = async (album: Album) => {
    try {
      await clientApi.deleteAlbum(album.id);
      setAlbums((prevAlbums) => prevAlbums.filter((a) => a.id !== album.id));
      setAlbumToDelete(null);
      toast({
        description: "Album deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting album:", error);
      toast({
        variant: "destructive",
        description: "Failed to delete album. Please try again.",
      });
    }
  };

  const handleEditClick = (album: Album) => {
    setSelectedAlbum(album);
    setShowAlbumModal(true);
  };

  // Reset selected album when main modal closes
  useEffect(() => {
    if (!open) {
      setSelectedAlbum(null);
      setShowAlbumModal(false);
    }
  }, [open]);

  const isLastAlbum = albums.length === 1 && albumToDelete !== null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Albums</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <button
              className="main-btn flex items-center gap-2 w-fit"
              onClick={() => {
                setSelectedAlbum(null);
                setShowAlbumModal(true);
              }}
            >
              <PlusIcon /> Create new album
            </button>

            <div className="grid gap-4 max-h-[500px] overflow-y-auto">
              {albums.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg border-dashed">
                  <FolderIcon className="w-12 h-12 text-gray-400 mb-3" />
                  <h3 className="font-medium text-gray-600 mb-1">
                    No albums yet
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Create your first album to organize your photos
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md">
                    <p className="text-sm text-blue-700">
                      <strong>Note:</strong> Creating your first album will
                      enable "Albums Mode". In this mode, only photos that are
                      added to albums will be visible in your gallery.
                    </p>
                  </div>
                </div>
              ) : (
                albums.map((album) => {
                  const coverImage = getCoverImage(album.cover_image_id!);
                  return (
                    <div
                      key={album.id}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      {coverImage && (
                        <div className="relative w-20 h-20 rounded-md overflow-hidden">
                          <img
                            src={coverImage.thumbnailUrl}
                            alt={album.title}
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium">{album.title}</h3>
                        <p className="text-sm text-gray-500">
                          {album.description}
                        </p>
                        <p className="text-xs text-gray-400">
                          Created{" "}
                          {album.created_at
                            ? new Date(album.created_at).toLocaleDateString()
                            : "unknown"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="text-gray-500 hover:text-gray-600"
                          onClick={() => handleEditClick(album)}
                        >
                          <Pencil size={20} />
                        </button>
                        <button
                          className="text-red-500 hover:text-red-600"
                          onClick={() => setAlbumToDelete(album)}
                        >
                          <Trash size={20} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlbumFormModal
        open={showAlbumModal}
        onOpenChange={setShowAlbumModal}
        onSubmit={selectedAlbum ? handleEditAlbum : handleCreateAlbum}
        images={images}
        initialData={selectedAlbum || undefined}
        mode={selectedAlbum ? "edit" : "create"}
      />

      <AlertDialog
        open={!!albumToDelete}
        onOpenChange={() => setAlbumToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              {isLastAlbum ? (
                <>
                  <p>
                    This is your last album. Deleting it will switch the gallery
                    back to "Flat Mode", where all photos will be visible
                    regardless of album status.
                  </p>
                  <p>
                    Are you sure you want to delete "{albumToDelete?.title}" and
                    switch back to Flat Mode?
                  </p>
                </>
              ) : (
                <>
                  This will permanently delete the album "{albumToDelete?.title}
                  ". This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => albumToDelete && handleDeleteAlbum(albumToDelete)}
            >
              {isLastAlbum ? "Delete and Switch to Flat Mode" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
