export interface MediaFileMetadata {
  width: number;
  height: number;
  cameraMake: string;
  cameraModel: string;
  focalLength: number;
  apertureFNumber: number;
  isoEquivalent: number;
  exposureTime: string;
}

export interface MediaFile {
  baseUrl: string;
  mimeType: string;
  filename: string;
  mediaFileMetadata: MediaFileMetadata;
}

export interface MediaItem {
  id: string;
  createTime: string;
  type: "PHOTO" | "VIDEO";
  mediaFile: MediaFile;
}

export interface MediaItemsResponse {
  mediaItems: MediaItem[];
  nextPageToken?: string;
}
