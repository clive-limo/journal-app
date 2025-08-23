export enum UploadKind {
  IMAGE = "IMAGE",
  AUDIO = "AUDIO",
}

export interface PresignUpload {
  kind: UploadKind;
  contentType: string;
  size: number;
}

export interface PresignResponse {
  method: string;
  uploadUrl: string;
  key: string;
  publicUrl: string;
  expiresIn: number;
  headers: Record<string, string>;
}

export interface AttachUploadedMedia {
  key: string;
  thumbKey?: string;
  durationS?: number;
  width?: number;
  height?: number;
}

export interface MediaObject {
  id?: string;
  entryId?: string;
  kind: "IMAGE" | "AUDIO";
  url: string;
  thumbUrl?: string;
  durationS?: number;
  width?: number;
  height?: number;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  uploadProgress?: number;
  isUploading?: boolean;
  error?: string;
}
