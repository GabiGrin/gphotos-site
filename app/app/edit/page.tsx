"use client";

import { LayoutConfig, Photo, Site } from "@/types/gphotos";
import { createClientApi } from "@/utils/dal/client-api";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import SettingsPanel from "./SettingsPanel";
import UserSite from "@/app/components/UserSite";
import { ManageImagesModal } from "@/app/components/modals/ManageImagesModal";
import { ImportImagesModal } from "@/app/components/modals/ImportImagesModal";
import { Button } from "@/components/ui/button";
import { ImageIcon, Loader2 } from "lucide-react";
import { toast, useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const supabase = createClient();

  const clientApi = createClientApi(supabase);

  const [user, setUser] = useState<User | null>(null);

  const [processedImages, setProcessedImages] = useState<Photo[]>();

  const router = useRouter();

  const [site, setSite] = useState<Site | null>(null);

  const [isManageImagesOpen, setIsManageImagesOpen] = useState(false);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>(
    site?.layout_config ?? ({} as any)
  );

  useEffect(() => {
    if (site?.layout_config) {
      setLayoutConfig(site.layout_config as LayoutConfig);
    }
  }, [site]);

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
      setIsImportModalOpen(true);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const siteWithLayoutConfig = useMemo(() => {
    return { ...site, layout_config: layoutConfig } as Site;
  }, [site, layoutConfig]);

  console.log("Site with layout config:", siteWithLayoutConfig);

  if (!user || !site) {
    return (
      <div className="flex-1 w-full flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <SettingsPanel
        defaultEmail={user?.email ?? ""}
        site={siteWithLayoutConfig}
        onChange={(config) => {
          console.log("Config changed:", config);
          setLayoutConfig(config);
        }}
        onManageImages={() => setIsManageImagesOpen(true)}
        onImportImages={() => setIsImportModalOpen(true)}
        images={processedImages}
      />

      <ManageImagesModal
        isOpen={isManageImagesOpen}
        onClose={() => setIsManageImagesOpen(false)}
        photos={processedImages || []}
        onImagesDeleted={fetchProcessedImages}
        onImportImages={() => setIsImportModalOpen(true)}
        userId={user.id}
      />

      <ImportImagesModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImagesImported={fetchProcessedImages}
      />

      {!processedImages || processedImages.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-2">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold">No images yet</h3>
          <p className="text-gray-600 text-center max-w-md">
            Start by importing some images from Google Photos to create your
            gallery
          </p>
          <Button
            onClick={() => setIsImportModalOpen(true)}
            className="mt-4 bg-blue-500"
          >
            Import Images
          </Button>
        </div>
      ) : (
        <UserSite layoutConfig={layoutConfig} images={processedImages} />
      )}
    </div>
  );
}
