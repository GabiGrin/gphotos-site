"use client";

import { LayoutConfig, Photo, ProcessedImage, Site } from "@/types/gphotos";
import { createClientApi } from "@/utils/dal/client-api";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getSiteUrl } from "@/utils/baseUrl";
import SettingsPanel from "./SettingsPanel";
import UserSite from "@/app/components/UserSite";
import { ManageImagesModal } from "@/app/components/modals/ManageImagesModal";
import { ImportImagesModal } from "@/app/components/modals/ImportImagesModal";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";

export default function DashboardPage() {
  const supabase = createClient();

  const clientApi = createClientApi(supabase);

  const [user, setUser] = useState<User | null>(null);

  const [pickerUrl, setPickerUrl] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const [imagesSet, setImagesSet] = useState(false);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(
    null
  );

  const [processedImages, setProcessedImages] = useState<Photo[]>();

  const router = useRouter();

  const [site, setSite] = useState<Site | null>(null);

  const [isManageImagesOpen, setIsManageImagesOpen] = useState(false);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const user = await supabase.auth.getUser();
      setUser(user.data.user);
      if (!user.data.user) {
        router.push("/sign-in");
      } else {
        getGoogleAccessToken();

        const site = await clientApi.getSiteByUserId(user.data.user.id);
        setSite(site);
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

  async function getGoogleAccessToken() {
    const session = await supabase.auth.getSession();

    if (!session || !session.data.session) {
      console.error("User is not logged in");
      return;
    }

    console.log("Session:", session);

    const googleAccessToken = session.data.session.provider_token;
    if (!googleAccessToken) {
      console.error("User is not logged in");
      return;
    }
    setGoogleAccessToken(googleAccessToken);

    const response = await fetch(
      "https://photospicker.googleapis.com/v1/sessions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + googleAccessToken,
        },
      }
    )
      .then((response) => response.json())
      .then((responseData) => {
        console.log("Session created:", responseData);
        setSessionId(responseData.id);
        setPickerUrl(responseData.pickerUri);
        return responseData;
      });

    console.log("Google Access Token:", googleAccessToken);
    return googleAccessToken;
  }

  useEffect(() => {
    if (pickerUrl && !imagesSet) {
      const timer = setInterval(async () => {
        console.log("Checking if images are set");

        const session_url = "https://photospicker.googleapis.com/v1/sessions/";

        const sessionResponse = await fetch(session_url + sessionId, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + googleAccessToken,
          },
        }).then((response) => response.json());

        if (sessionResponse.mediaItemsSet) {
          setImagesSet(true);
        }

        console.log("Session response:", sessionResponse);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [pickerUrl, imagesSet]);

  useEffect(() => {
    if (imagesSet) {
      const processSession = async () => {
        const res = await fetch("/api/process-session", {
          method: "POST",
          body: JSON.stringify({ sessionId }),
        }).then((res) => res.json());
        console.log("Process session response:", res);
      };

      processSession();
    }
  }, [imagesSet]);

  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>(
    site?.layout_config ?? ({} as any)
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("modal") === "import") {
      setIsImportModalOpen(true);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  if (!user) {
    return "Loading..";
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <SettingsPanel
        defaultEmail={user?.email ?? ""}
        site={{ ...site, layout_config: layoutConfig } as Site}
        onChange={(config) => {
          console.log("Config changed:", config);
          setLayoutConfig(config);
        }}
        onManageImages={() => setIsManageImagesOpen(true)}
      />

      <ManageImagesModal
        isOpen={isManageImagesOpen}
        onClose={() => setIsManageImagesOpen(false)}
        photos={processedImages || []}
        onImagesDeleted={fetchProcessedImages}
        onImportImages={() => setIsImportModalOpen(true)}
      />

      <ImportImagesModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

      {!processedImages || processedImages.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold">No images yet</h3>
          <p className="text-gray-600 text-center max-w-md">
            Start by importing some images from Google Photos to create your
            gallery
          </p>
          <Button onClick={() => setIsImportModalOpen(true)} className="mt-4">
            Import Images
          </Button>
        </div>
      ) : (
        <UserSite
          layoutConfig={site?.layout_config ?? ({} as any)}
          images={processedImages}
        />
      )}
    </div>
  );
}
