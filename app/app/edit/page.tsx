"use client";

import { LayoutConfig, ProcessedImage, Site } from "@/types/gphotos";
import { createClientApi } from "@/utils/dal/client-api";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getSiteUrl } from "@/utils/baseUrl";
import SettingsPanel from "./SettingsPanel";
import UserSite from "@/app/components/UserSite";

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

  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>();

  const router = useRouter();

  const [site, setSite] = useState<Site | null>(null);

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

  useEffect(() => {
    if (user) {
      console.log("Getting processed images");
      clientApi
        .getProcessedImages(user.id)
        .then((images) => {
          console.log("Images:", images);
          setProcessedImages(images);
        })
        .catch((error) => {
          console.error("Error getting processed images:", error);
        });
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
      />

      <UserSite
        layoutConfig={site?.layout_config ?? ({} as any)}
        images={processedImages || []}
      />
      <div className="flex flex-col items-center gap-4">
        {pickerUrl && (
          <a
            href={pickerUrl}
            target="_blank"
            rel="noopener"
            className="text-blue-600 hover:underline"
          >
            Open Google Photos Picker
          </a>
        )}

        {!imagesSet && pickerUrl && (
          <p className="text-gray-600">Waiting for user selection...</p>
        )}

        {imagesSet && <p className="text-green-600">Images are uploading...</p>}

        {site && <a href={getSiteUrl(site.username)}>View your images</a>}
      </div>

      {processedImages && processedImages.length > 0 ? (
        <div className="w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Thumbnail</TableHead>
                <TableHead>Upload Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedImages.map((image, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Avatar className="h-20 w-20">
                      <AvatarImage
                        src={image.thumbnail_url}
                        alt={`Thumbnail ${index + 1}`}
                      />
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    {new Date(image.gphotos_created_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-gray-600">No processed images available.</p>
      )}
    </div>
  );
}
