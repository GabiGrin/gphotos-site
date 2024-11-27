"use client";

import { Album, LayoutConfig, Photo, Site } from "@/types/myphotos";
import { createClientApi } from "@/utils/dal/client-api";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import SettingsPanel from "./SettingsPanel";
import UserSite from "@/app/components/UserSite";
import { ManageImagesModal } from "@/app/components/modals/ManageImagesModal";
import { ImportImagesModal } from "@/app/components/modals/ImportImagesModal";
import { ImageIcon, Loader2 } from "lucide-react";
import { toast, useToast } from "@/hooks/use-toast";
import { usePremiumLimits } from "@/hooks/use-premium-limits";
import { WelcomeScreen } from "@/app/components/WelcomeScreen";
import { CongratulationsModal } from "@/app/components/modals/CongratulationsModal";

export default function DashboardPage() {
  const supabase = createClient();

  const clientApi = createClientApi(supabase);

  const [user, setUser] = useState<User | null>(null);

  const [processedImages, setProcessedImages] = useState<Photo[]>();

  const router = useRouter();

  const [site, setSite] = useState<Site | null>(null);

  const [isManageImagesOpen, setIsManageImagesOpen] = useState(false);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const [hasLoadedConfig, setHasLoadedConfig] = useState(false);

  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>(
    {} as LayoutConfig
  );

  const [albums, setAlbums] = useState<Album[]>([]);

  const [shouldShowCongratulations, setShouldShowCongratulations] =
    useState(false);

  const limits = usePremiumLimits(site);

  useEffect(() => {
    if (site?.layout_config && !hasLoadedConfig) {
      setLayoutConfig(site.layout_config as LayoutConfig);
      setHasLoadedConfig(true);
      setTimeout(() => {
        setIsInitialLoad(false);
      }, 100);
    }
  }, [site, hasLoadedConfig]);

  useEffect(() => {
    const getUser = async () => {
      const user = await supabase.auth.getUser();
      setUser(user.data.user);
      if (!user.data.user) {
        router.push("/sign-in");
      } else {
        try {
          const site = await clientApi.getSiteByUserId(user.data.user.id);
          console.log("Site:", site);
          setSite(site);
        } catch (error) {
          toast({
            title: "Site not found",
            description: "Redirecting to create page",
          });
          console.error("Error getting site:", error);
          router.push("/create");
        }
      }
    };

    getUser();
  }, []);

  const fetchProcessedImages = async () => {
    if (user) {
      console.log("Getting processed images");
      try {
        const images = await clientApi.getProcessedImages(user.id);
        console.log("Images:", images);
        setProcessedImages(images);

        if (images.length > 0 && processedImages?.length === 0) {
          setShouldShowCongratulations(true);
        }
      } catch (error) {
        console.error("Error getting processed images:", error);
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchProcessedImages();
    }
  }, [user]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("modal") === "import") {
      setIsManageImagesOpen(true);
      setIsImportModalOpen(true);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const fetchAlbums = async () => {
    if (user) {
      try {
        const albums = await clientApi.getAlbums(user.id);
        setAlbums(albums);
      } catch (error) {
        console.error("Error getting albums:", error);
        toast({
          variant: "destructive",
          description: "Failed to load albums. Please try again.",
        });
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchAlbums();
    }
  }, [user]);

  const siteWithLayoutConfig = useMemo(
    () =>
      ({
        ...site,
        layout_config: layoutConfig,
      }) as Site,
    [site?.username, layoutConfig, albums]
  );

  const handleAssignToAlbum = async (photoIds: string[], albumId: string) => {
    try {
      await clientApi.assignPhotosToAlbum(photoIds, albumId);
      // Refresh the photos/albums data
      await fetchProcessedImages();
    } catch (error) {
      console.error("Failed to assign photos to album:", error);
      throw error; // Let the modal handle the error display
    }
  };

  if (!user || !site || !processedImages) {
    return (
      <div className="flex-1 w-full flex items-center justify-center py-56">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <p className="text-gray-600">
            Loading your gallery website settings...
          </p>
        </div>
      </div>
    );
  }

  if (processedImages.length === 0) {
    return (
      <div className="flex-1 w-full">
        <WelcomeScreen onImport={() => setIsImportModalOpen(true)} />

        <ImportImagesModal
          isOpen={isImportModalOpen}
          onClose={() => {
            setIsImportModalOpen(false);
            fetchProcessedImages();
          }}
          onImagesImported={fetchProcessedImages}
          site={siteWithLayoutConfig}
          currentPhotoCount={processedImages.length}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <SettingsPanel
        defaultEmail={user?.email ?? ""}
        site={siteWithLayoutConfig}
        onChange={(config) => {
          if (hasLoadedConfig && !isInitialLoad) {
            setLayoutConfig(config);
          }
        }}
        onManageImages={() => setIsManageImagesOpen(true)}
        onImportImages={() => setIsImportModalOpen(true)}
        images={processedImages}
        albums={albums}
        onAlbumsChange={setAlbums}
      />

      {isManageImagesOpen && (
        <ManageImagesModal
          albums={albums}
          isOpen={isManageImagesOpen}
          onClose={() => setIsManageImagesOpen(false)}
          photos={processedImages}
          onImagesDeleted={fetchProcessedImages}
          onImportImages={() => setIsImportModalOpen(true)}
          onAssignToAlbum={handleAssignToAlbum}
          userId={user.id}
          site={siteWithLayoutConfig}
        />
      )}

      {isImportModalOpen && (
        <ImportImagesModal
          isOpen={isImportModalOpen}
          onClose={() => {
            setIsImportModalOpen(false);
            fetchProcessedImages();
          }}
          onImagesImported={fetchProcessedImages}
          site={siteWithLayoutConfig}
          currentPhotoCount={processedImages.length}
        />
      )}

      <CongratulationsModal
        isOpen={shouldShowCongratulations}
        username={site.username}
        onClose={() => setShouldShowCongratulations(false)}
      />

      <UserSite
        layoutConfig={layoutConfig}
        images={processedImages}
        albums={albums}
        showBranding={limits.branding}
        hostname={site.username}
        isEmbed={false}
      />
    </div>
  );
}
