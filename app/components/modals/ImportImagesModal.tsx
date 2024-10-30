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
import { useToast } from "@/hooks/use-toast";
import { processGPhotosSession } from "@/utils/dal/client-api";
import { getBaseUrl } from "@/utils/baseUrl";

interface ImportImagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImagesImported?: () => void;
}

export function ImportImagesModal({
  isOpen,
  onClose,
  onImagesImported,
}: ImportImagesModalProps) {
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
  const [isInitializing, setIsInitializing] = useState(true);
  const { toast } = useToast();

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      // Reset states when modal opens
      setIsInitializing(true);
      setNeedsReauth(false);
      setPickerUrl(null);
      setSessionId(null);
      setImagesSet(false);
      setStatus("initial");

      checkAndGetGoogleToken();
    }
  }, [isOpen]);

  const checkAndGetGoogleToken = async () => {
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.provider_token;

      if (!token) {
        setNeedsReauth(true);
        setIsInitializing(false);
        return;
      }

      setGoogleAccessToken(token);
      await createPickerSession(token);
      setIsInitializing(false);
    } catch (error) {
      console.error("Error during initialization:", error);
      setIsInitializing(false);
      setNeedsReauth(true);
    }
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

            try {
              const result = await processGPhotosSession(sessionId);
              console.log("Process session response:", result);

              if (result.count) {
                toast({
                  title: "Images imported successfully",
                  description: `${result.count} ${
                    result.count === 1 ? "image" : "images"
                  } imported from Google Photos`,
                  duration: 5000,
                });
              }
            } catch (error) {
              console.error("Error processing session:", error);
              toast({
                title: "Error importing images",
                description:
                  "There was a problem importing your images. Please try again.",
                variant: "destructive",
              });
            }

            // Wait 15 seconds then close and refresh
            setTimeout(() => {
              onClose();
              onImagesImported?.();
              router.refresh();
            }, 15000);
          }
        } catch (error) {
          console.error("Error checking session:", error);
        }
      }, 5000);

      return () => clearInterval(timer);
    }
  }, [
    pickerUrl,
    status,
    sessionId,
    googleAccessToken,
    onClose,
    onImagesImported,
    toast,
  ]);

  const handleReauth = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${getBaseUrl()}/auth/callback`,
          scopes:
            "https://www.googleapis.com/auth/userinfo.email, https://www.googleapis.com/auth/userinfo.profile, https://www.googleapis.com/auth/photospicker.mediaitems.readonly",
        },
      });
      onClose();
    } catch (error) {
      console.error("Error signing in with Google:", error);
      toast({
        title: "Error signing in",
        description:
          "There was a problem signing in with Google. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Images</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-8">
          {isInitializing ? (
            <div className="flex items-center gap-2 text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-600 border-t-transparent"></div>
              Initializing...
            </div>
          ) : needsReauth ? (
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
