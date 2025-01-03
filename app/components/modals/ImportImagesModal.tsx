import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { getGPhotosClient } from "@/utils/gphotos";
import { useToast } from "@/hooks/use-toast";
import { processGPhotosSession } from "@/utils/dal/client-api";
import { getBaseUrl } from "@/utils/baseUrl";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Site } from "@/types/myphotos";
import { usePremiumLimits } from "@/hooks/use-premium-limits";
import { premiumPlans } from "@/premium/plans";
import { createClientApi } from "@/utils/dal/client-api";
import { Database } from "@/types/supabase";

interface ImportImagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImagesImported?: () => void;
  currentPhotoCount: number;
  site: Site;
}

type ImportStatus =
  | "initial"
  | "waiting"
  | "processing"
  | "completed"
  | "failed"
  | "partially_failed";

type UploadStatus =
  Database["public"]["Tables"]["upload_session_status"]["Row"];

export function ImportImagesModal({
  isOpen,
  onClose,
  onImagesImported,
  site,
  currentPhotoCount,
}: ImportImagesModalProps) {
  const [pickerUrl, setPickerUrl] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(
    null
  );
  const [imagesSet, setImagesSet] = useState(false);
  const [status, setStatus] = useState<ImportStatus>("initial");
  const [needsReauth, setNeedsReauth] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const { toast } = useToast();
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [gPhotosError, setGPhotosError] = useState<{
    email: string | null;
    message: string;
  } | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(null);

  const supabase = createClient();
  const pathname = usePathname();

  const limits = usePremiumLimits(site);

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

  useEffect(() => {
    if (!sessionId || status !== "processing") return;

    const api = createClientApi(supabase);
    const subscription = api.subscribeToUploadSession(sessionId, (status) => {
      setUploadStatus(status);
      console.log("Upload session status:", status);

      switch (status.status) {
        case "completed":
          toast({
            description: `${status.total_completed} photos imported successfully!`,
          });
          onClose();
          if (onImagesImported) {
            onImagesImported();
          }
          break;

        case "partially_failed":
          toast({
            description: `${status.total_completed} photos imported. ${status.total_failed} couldn't be transferred.`,
            variant: "destructive",
          });
          onClose();
          if (onImagesImported) {
            onImagesImported();
          }
          break;

        case "failed":
          toast({
            title: "Import failed",
            description: "Failed to import photos. Please try again.",
            variant: "destructive",
          });
          setStatus("failed");
          break;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [sessionId, status]);

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
      const session = await supabase.auth.getSession();
      const userEmail = session.data.session?.user?.email || null;

      if (error instanceof Error) {
        if (error.message === "AUTH_REQUIRED") {
          setNeedsReauth(true);
          setIsInitializing(false);
          return;
        }

        if (error.message === "SETUP_REQUIRED") {
          setGPhotosError({
            email: userEmail,
            message:
              "This usually means Google Photos needs to be set up first.",
          });
          return;
        }

        if (error.message.startsWith("UNKNOWN_ERROR:")) {
          const statusCode = error.message.split(":")[1];
          setGPhotosError({
            email: userEmail,
            message: `Unable to connect to Google Photos (${statusCode}). Please try again later.`,
          });
          return;
        }
      }

      setGPhotosError({
        email: userEmail,
        message: "Unable to connect to Google Photos. Please try again later.",
      });
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

          console.log("Checking session status:", data);

          if (data.mediaItemsSet) {
            setImagesSet(true);
            setStatus("processing");
            clearInterval(timer);

            try {
              console.log("Starting process session...");
              const result = await processGPhotosSession(sessionId);
              console.log("Process session response:", result);
            } catch (error) {
              console.error("Error processing session:", error);
              setStatus("failed");
              toast({
                title: "Error importing images",
                description:
                  "There was a problem importing your images. Please try again.",
                variant: "destructive",
              });
            }
          }
        } catch (error) {
          console.error("Error checking session:", error);
        }
      }, 5000);

      return () => clearInterval(timer);
    }
  }, [pickerUrl, status, sessionId, googleAccessToken]);

  const renderStatusMessage = () => {
    if (!sessionId) return null;

    if (status === "processing" && !uploadStatus) {
      return (
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
            <div className="flex flex-col">
              <span className="font-bold">Starting import...</span>
              <span className="text-sm text-gray-600">
                Preparing to process your photos
              </span>
            </div>
          </div>
        </div>
      );
    }

    if (!uploadStatus) return null;

    switch (uploadStatus.status) {
      case "scanning":
        return (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
              <div className="flex flex-col">
                <span className="font-bold">Preparing your photos...</span>
                <span className="text-sm text-gray-600">
                  Found {uploadStatus.total_images} photos so far
                </span>
              </div>
            </div>
          </div>
        );

      case "uploading":
      case "processing":
        return (
          <div className="flex flex-col items-center gap-4">
            <div className="w-full max-w-md bg-gray-100 rounded-full h-2.5">
              <div
                className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                style={{
                  width: `${(uploadStatus.total_completed / uploadStatus.total_images) * 100}%`,
                }}
              ></div>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-600 border-t-transparent"></div>
              <div className="flex flex-col">
                <span className="font-bold">Almost there!</span>
                <span className="text-sm text-gray-600">
                  {uploadStatus.total_completed} of {uploadStatus.total_images}{" "}
                  photos uploaded securely
                </span>
              </div>
            </div>
          </div>
        );

      case "completed":
        return (
          <div className="flex items-center gap-2 text-green-600">
            <span className="font-bold">Success! Your photos are ready.</span>
          </div>
        );

      case "partially_failed":
        return (
          <div className="flex items-center gap-2 text-amber-600">
            <span className="font-bold">
              {uploadStatus.total_failed} photos couldn't be transferred, but{" "}
              {uploadStatus.total_completed} were imported successfully!
            </span>
          </div>
        );

      case "failed":
        return (
          <div className="flex items-center gap-2 text-red-600">
            <span className="font-bold">
              Failed to import photos. Please try again.
            </span>
          </div>
        );

      default:
        return null;
    }
  };

  const handleReauth = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${getBaseUrl()}/auth/callback?next=${encodeURIComponent(pathname)}?modal=import`,
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

  const handleCloseAttempt = (open: boolean) => {
    // If trying to close (open becomes false) and import is in progress
    if (!open && (status === "processing" || status === "waiting")) {
      setShowConfirmClose(true);
      return;
    }
    // Otherwise, allow normal close
    onClose();
  };

  const handleConfirmedClose = () => {
    setShowConfirmClose(false);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleCloseAttempt}>
        <VisuallyHidden>
          <DialogTitle>Import Images</DialogTitle>
        </VisuallyHidden>
        <DialogContent
          className="sm:max-w-md"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <div className="flex flex-col items-center gap-4 py-8">
            {isInitializing ? (
              <div className="flex items-center gap-2 text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-600 border-t-transparent"></div>
                <span className="font-bold">
                  Setting up secure connection...
                </span>
              </div>
            ) : gPhotosError ? (
              <div className="flex flex-col items-center gap-4">
                <div className="text-gray-600 mb-2">
                  <svg
                    className="w-12 h-12 mx-auto mb-4 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-center font-medium mb-2">
                    Having trouble connecting to Google Photos
                  </p>
                  <p className="text-sm text-gray-600 text-center">
                    We couldn't access Google Photos for {gPhotosError.email}.
                    This usually means Google Photos needs to be set up first.{" "}
                    <a
                      href="https://photos.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Visit Google Photos
                    </a>{" "}
                    to get started.
                  </p>
                  <p className="text-sm text-gray-500 text-center mt-4">
                    Still having issues?{" "}
                    <a
                      href="mailto:hey@myphotos.site"
                      className="text-blue-500 hover:underline"
                    >
                      Contact our support team
                    </a>
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setGPhotosError(null);
                    checkAndGetGoogleToken();
                  }}
                  className="mt-4"
                >
                  Try Again
                </Button>
              </div>
            ) : needsReauth ? (
              <div className="flex flex-col items-center gap-4">
                <p className="text-sm text-gray-600 text-center">
                  <span className="font-bold">Your privacy matters.</span>{" "}
                  Please verify your Google Photos access to ensure only you can
                  access your photos.
                </p>
                <Button
                  onClick={handleReauth}
                  className="bg-blue-500 text-white hover:bg-blue-600"
                >
                  Connect with Google Photos
                </Button>
              </div>
            ) : (
              <>
                {status === "initial" && pickerUrl && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="font-bold text-lg mb-2">
                        Import from Google Photos
                      </h3>
                      <p className="text-sm text-gray-600">
                        Select photos from your private Google Photos collection
                        in 2 simple steps
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium">
                          1
                        </span>
                        <div>
                          <p className="font-medium">Select your photos</p>
                          <p className="text-sm text-gray-600">
                            Click the button below to open Google Photos in a
                            new tab
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium">
                          2
                        </span>
                        <div>
                          <p className="font-medium">Return here to complete</p>
                          <p className="text-sm text-gray-600">
                            After selecting photos, click "Done" in Google
                            Photos and switch back to this tab
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-center pt-2">
                        <a
                          href={pickerUrl}
                          target="_blank"
                          rel="noopener"
                          className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center space-x-2"
                          onClick={handlePickerClick}
                        >
                          <span>Open Google Photos</span>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                      {limits.photoLimit - currentPhotoCount <
                      limits.photoLimit ? (
                        <p>
                          You can import up to{" "}
                          <span className="font-medium">
                            {limits.photoLimit - currentPhotoCount}
                          </span>{" "}
                          more photos
                          {site.premium_plan === "free" && (
                            <>
                              {" "}
                              —{" "}
                              <a
                                href="?upgrade=true"
                                className="text-blue-500 hover:underline"
                              >
                                upgrade
                              </a>{" "}
                              to import up to {premiumPlans.pro.photoLimit}
                            </>
                          )}
                        </p>
                      ) : (
                        <p>
                          You can import up to{" "}
                          <span className="font-medium">
                            {limits.photoLimit}
                          </span>{" "}
                          photos
                          {!site.premium_plan && (
                            <>
                              {" "}
                              —{" "}
                              <a
                                href="?upgrade=true"
                                className="text-blue-500 hover:underline"
                              >
                                upgrade
                              </a>{" "}
                              for up to {premiumPlans.pro.photoLimit} photos
                            </>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {status === "waiting" && (
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-600 border-t-transparent"></div>
                      <span className="font-bold">
                        Take your time selecting photos...
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 text-center">
                      If you accidentally closed the Google Photos tab, you can{" "}
                      <a
                        href={pickerUrl!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        click here
                      </a>{" "}
                      to reopen it.
                    </p>
                  </div>
                )}

                {(status === "processing" ||
                  status === "completed" ||
                  status === "failed" ||
                  status === "partially_failed") &&
                  renderStatusMessage()}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmClose} onOpenChange={setShowConfirmClose}>
        <DialogContent
          className="sm:max-w-[425px]"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Cancel Import?</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel the import? This process cannot be
              resumed and you'll need to start over.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowConfirmClose(false)}
            >
              Continue Import
            </Button>
            <Button variant="destructive" onClick={handleConfirmedClose}>
              Cancel Import
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
