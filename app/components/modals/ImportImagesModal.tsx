import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { getGPhotosClient } from "@/utils/gphotos";

interface ImportImagesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportImagesModal({ isOpen, onClose }: ImportImagesModalProps) {
  const [pickerUrl, setPickerUrl] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(
    null
  );
  const [imagesSet, setImagesSet] = useState(false);
  const [status, setStatus] = useState<"initial" | "waiting" | "importing">(
    "initial"
  );
  const [needsReauth, setNeedsReauth] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      // Reset states when modal opens
      setNeedsReauth(false);
      setPickerUrl(null);
      setSessionId(null);
      setImagesSet(false);
      setStatus("initial");

      checkAndGetGoogleToken();
    }
  }, [isOpen]);

  const checkAndGetGoogleToken = async () => {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.provider_token;

    if (!token) {
      setNeedsReauth(true);
      return;
    }

    setGoogleAccessToken(token);
    createPickerSession(token);
  };

  const createPickerSession = async (token: string) => {
    try {
      const gPhotosClient = getGPhotosClient();
      const data = await gPhotosClient.createPickerSession(token);
      setSessionId(data.id);
      setPickerUrl(data.pickerUri);
    } catch (error) {
      console.error("Error creating picker session:", error);
    }
  };

  const handlePickerClick = () => {
    setStatus("waiting");
  };

  useEffect(() => {
    if (pickerUrl && status === "waiting") {
      const timer = setInterval(async () => {
        if (!sessionId || !googleAccessToken) return;

        try {
          const gPhotosClient = getGPhotosClient();
          const data = await gPhotosClient.getSession({
            sessionId,
            token: googleAccessToken,
          });

          if (data.mediaItemsSet) {
            setImagesSet(true);
            setStatus("importing");

            // Add import job
            try {
              const response = await fetch("/api/process-session", {
                method: "POST",
                body: JSON.stringify({ sessionId }),
              });
              const result = await response.json();
              console.log("Process session response:", result);
            } catch (error) {
              console.error("Error processing session:", error);
            }

            // Wait 15 seconds then close
            setTimeout(() => {
              onClose();
              // Refresh the page to show new images
              router.refresh();
            }, 15000);
          }
        } catch (error) {
          console.error("Error checking session:", error);
        }
      }, 5000);

      return () => clearInterval(timer);
    }
  }, [pickerUrl, status, sessionId, googleAccessToken]);

  const handleReauth = () => {
    const currentPath = window.location.pathname;
    const returnUrl = `${currentPath}?modal=import`;
    router.push(`/sign-in?returnUrl=${encodeURIComponent(returnUrl)}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Images</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-8">
          {needsReauth ? (
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-gray-600 text-center">
                Your Google Photos access has expired. You'll need to sign in
                again to continue importing photos.
              </p>
              <Button
                onClick={handleReauth}
                className="bg-blue-500 text-white hover:bg-blue-600"
              >
                Sign in with Google
              </Button>
            </div>
          ) : (
            <>
              {status === "initial" && pickerUrl && (
                <>
                  <p className="text-sm text-gray-600 text-center mb-4">
                    Click the button below to open Google Photos in a new tab.
                    Select your images there and return to this page to continue
                    the import process.
                  </p>
                  <a
                    href={pickerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                    onClick={handlePickerClick}
                  >
                    Select Photos from Google Photos
                  </a>
                </>
              )}

              {status === "waiting" && (
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-600 border-t-transparent"></div>
                  Waiting for photo selection...
                </div>
              )}

              {status === "importing" && (
                <div className="flex items-center gap-2 text-green-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-600 border-t-transparent"></div>
                  Importing selected photos...
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
