import { MediaItemsResponse } from "@/types/google-photos";

export function getGPhotosClient() {
  return {
    listMediaItems: async ({
      sessionId,
      pageToken,
      pageSize,
      token,
    }: {
      sessionId: string;
      pageToken?: string;
      pageSize?: number;
      token: string;
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
      sessionId,
      token,
      mediaItemId,
    }: {
      sessionId: string;
      token: string;
      mediaItemId: string;
    }): Promise<Blob> => {
      return fetch(
        `https://photospicker.googleapis.com/v1/mediaItems/${mediaItemId}?sessionId=${sessionId}`,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      ).then((response) => response.blob());
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
  };
}
