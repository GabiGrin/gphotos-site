import { MediaItemsResponse } from "@/types/google-photos";

export function getGPhotosClient() {
  return {
    listMediaItems: async ({
      sessionId,
      pageToken,
      pageSize,
      googleAccessToken: token,
    }: {
      sessionId: string;
      pageToken?: string;
      pageSize: number;
      googleAccessToken: string;
    }): Promise<MediaItemsResponse> => {
      let itemsQuery = `sessionId=${sessionId}&pageSize=${pageSize}`;
      if (pageToken) {
        itemsQuery += `&pageToken=${pageToken}`;
      }

      return fetch(
        `https://photospicker.googleapis.com/v1/mediaItems?${itemsQuery}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        }
      ).then((response) => response.json());
    },
    getImage: async ({
      token,
      baseUrl,
      width,
      height,
    }: {
      token: string;
      baseUrl: string;
      width: number;
      height: number;
    }): Promise<Blob> => {
      return fetch(`${baseUrl}=w${width}-h${height}`, {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
        },
      }).then((response) => response.blob());
    },
    getSession: async ({
      sessionId,
      token,
    }: {
      sessionId: string;
      token: string;
    }): Promise<{ mediaItemsSet: boolean }> => {
      return fetch(
        `https://photospicker.googleapis.com/v1/sessions/${sessionId}`,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      ).then((response) => response.json());
    },
    createPickerSession: async (
      token: string
    ): Promise<{ id: string; pickerUri: string }> => {
      const response = await fetch(
        "https://photospicker.googleapis.com/v1/sessions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("AUTH_REQUIRED");
        }

        if (response.status === 400) {
          throw new Error("SETUP_REQUIRED");
        }

        throw new Error(`UNKNOWN_ERROR:${response.status}`);
      }

      const data = await response.json();
      if (!data.id || !data.pickerUri) {
        throw new Error("INVALID_RESPONSE");
      }

      return data;
    },
    getAuthScopes: async (token: string) => {
      return fetch(
        `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`
      ).then((response) => response.json());
    },
  };
}

export const MAX_MEDIA_ITEMS_PER_PAGE = 100;
