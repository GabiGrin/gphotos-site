"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Album, Site } from "@/types/myphotos";
import { getSiteUrl } from "@/utils/baseUrl";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import posthog from "posthog-js";
import { toast } from "@/hooks/use-toast";

interface EmbedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  site: Site;
  albums: Album[];
}

export default function EmbedModal({
  open,
  onOpenChange,
  site,
  albums,
}: EmbedModalProps) {
  const [showContent, setShowContent] = useState(true);
  const [showButtons, setShowButtons] = useState(true);
  const [showSpecificAlbum, setShowSpecificAlbum] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<string>("all");
  const [copied, setCopied] = useState(false);
  const [fullWidth, setFullWidth] = useState(true);

  useEffect(() => {
    if (!open) {
      setShowContent(true);
      setShowButtons(true);
      setShowSpecificAlbum(false);
      setSelectedAlbum("all");
      setCopied(false);
      setFullWidth(true);
    }
  }, [open]);

  useEffect(() => {
    if (showSpecificAlbum && albums.length > 0) {
      setSelectedAlbum(albums[0].id);
    } else {
      setSelectedAlbum("all");
    }
  }, [showSpecificAlbum, albums]);

  const baseUrl = getSiteUrl(site.username);
  const embedUrl = new URL(baseUrl);

  embedUrl.searchParams.set("embed", "true");
  if (!showContent) embedUrl.searchParams.set("hideContent", "true");
  if (!showButtons) embedUrl.searchParams.set("hideButtons", "true");
  if (showSpecificAlbum && selectedAlbum !== "all") {
    embedUrl.searchParams.set("album", selectedAlbum);
  }
  if (!fullWidth) embedUrl.searchParams.set("contained", "true");

  const iframeCode = `<iframe
  src="${embedUrl.toString()}"
  style="width: 100%; height: 600px; border: none; border-radius: 8px;"
  allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen
></iframe>`;

  const handleCopy = async () => {
    try {
      if (!navigator?.clipboard) {
        throw new Error("Clipboard API not available");
      }

      await navigator.clipboard.writeText(iframeCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      toast({
        title: "Copied to clipboard",
        description: "You can now paste the embed code into your website",
      });

      posthog.capture("embed_code_copied", {
        siteUsername: site.username,
        albumId: showSpecificAlbum ? selectedAlbum : undefined,
        showContent,
        showButtons,
      });
    } catch (err) {
      console.error("Failed to copy:", err);
      toast({
        title: "Failed to copy",
        description: "Please try copying the code manually",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Embed Gallery</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-6 py-4">
          <div className="flex flex-col gap-4">
            {albums.length > 0 && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-specific-album">
                    Show specific album
                  </Label>
                  <Switch
                    id="show-specific-album"
                    checked={showSpecificAlbum}
                    onCheckedChange={setShowSpecificAlbum}
                  />
                </div>

                {showSpecificAlbum && (
                  <Select
                    value={selectedAlbum}
                    onValueChange={setSelectedAlbum}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select album" />
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
              </div>
            )}

            <div className="flex items-center justify-between">
              <Label htmlFor="show-content">
                Show content (title, description)
              </Label>
              <Switch
                id="show-content"
                checked={showContent}
                onCheckedChange={setShowContent}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show-buttons">Show buttons</Label>
              <Switch
                id="show-buttons"
                checked={showButtons}
                onCheckedChange={setShowButtons}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="full-width">Full width</Label>
              <Switch
                id="full-width"
                checked={fullWidth}
                onCheckedChange={setFullWidth}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Embed Code</Label>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap break-all">
                {iframeCode}
              </pre>
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
