import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

interface MediaItem {
  id: string;
  createTime: string;
  type: "PHOTO" | "VIDEO";
  mediaFile: {
    baseUrl: string;
    mimeType: string;
    filename: string;
    mediaFileMetadata: {
      width: number;
      height: number;
      cameraMake: string;
      cameraModel: string;
      focalLength: number;
      apertureFNumber: number;
      isoEquivalent: number;
      exposureTime: string;
    };
  };
}

interface MediaItemsResponse {
  mediaItems: MediaItem[];
}

export async function POST(req: NextRequest) {
  const client = await createClient();
  const { data, error } = await client.auth.getUser();
  if (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }

  if (!data.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  console.log("got body", body);

  const sessionId = body.sessionId;
  const session = await client.auth.getSession();

  const googleAccessToken = session.data.session?.provider_token;

  if (!googleAccessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let itemsQuery = `sessionId=${sessionId}&pageSize=100`;

  const response = await fetch(
    `https://photospicker.googleapis.com/v1/mediaItems?${itemsQuery}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + googleAccessToken,
      },
    }
  ).then((res) => res.json());

  const { mediaItems } = response;

  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Upload each image to Supabase storage
  for (const item of mediaItems) {
    const imageResponse = await fetch(item.mediaFile.baseUrl + "=w128-h128", {
      headers: new Headers({
        Authorization: `Bearer ${googleAccessToken}`,
      }),
    });
    const imageBlob = await imageResponse.blob();

    const fileName = `${data.user.id}/${item.id}.jpg`;
    const { data: uploadData, error: uploadError } = await serviceClient.storage
      .from("images")
      .upload(fileName, imageBlob, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      console.error(`Error uploading image ${item.id}:`, uploadError);
    } else {
      console.log(`Successfully uploaded image ${item.id}`);
    }
  }

  //   console.log("Response:", responseData);

  return NextResponse.json({
    message: "Hello from the API!",
    userId: data.user.id,
    response,
  });
}
