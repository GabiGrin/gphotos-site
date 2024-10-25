"use client";

import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { InfoIcon } from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProtectedPage() {
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);

  const [pickerUrl, setPickerUrl] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const [imagesSet, setImagesSet] = useState(false);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(
    null
  );

  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const user = await supabase.auth.getUser();
      setUser(user.data.user);
      if (!user.data.user) {
        router.push("/sign-in");
      } else {
        getGoogleAccessToken();
      }
    };

    getUser();
  }, []);

  async function getGoogleAccessToken() {
    const session = await supabase.auth.getSession();

    if (!session || !session.data.session) {
      console.error("User is not logged in");
      return;
    }

    console.log("Session:", session);

    const googleAccessToken = session.data.session.provider_token;
    setGoogleAccessToken(googleAccessToken!);

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
      let itemsQuery = `sessionId=${sessionId}&pageSize=100`;

      fetch(`https://photospicker.googleapis.com/v1/mediaItems?${itemsQuery}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + googleAccessToken,
        },
      })
        .then((response) => response.json())
        .then((responseData) => {
          console.log("Response:", responseData);
        });
    }
  }, [imagesSet]);

  if (!user) {
    return "Loading..";
  }

  // const googleAccessToken = await getGoogleAccessToken();

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="flex flex-col items-center gap-4">
        {pickerUrl && (
          <a
            href={pickerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Open Google Photos Picker
          </a>
        )}

        {!imagesSet && pickerUrl && (
          <p className="text-gray-600">Waiting for user selection...</p>
        )}

        {imagesSet && <p className="text-green-600">Images are uploading...</p>}
      </div>
    </div>
  );
}
