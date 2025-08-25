import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/lib/axios';
import type {
  PresignUpload,
  PresignResponse,
  AttachUploadedMedia,
  MediaObject,
} from '@/types/media';
import { UploadKind } from '@/types/media';

export const useMediaStore = defineStore('media', () => {
  const uploadQueue = ref<MediaObject[]>([]);
  const uploadedMedia = ref<MediaObject[]>([]);
  const isUploading = ref(false);
  const error = ref<string | null>(null);

  // Constants
  const MAX_IMAGE_SIZE = 15 * 1024 * 1024; // 15MB
  const MAX_AUDIO_SIZE = 50 * 1024 * 1024; // 50MB

  const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
  ];

  const ALLOWED_AUDIO_TYPES = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/webm',
    'audio/ogg',
    'audio/mp4',
    'audio/x-m4a',
  ];

  // Validation
  function validateFile(file: File, kind: UploadKind): string | null {
    if (kind === UploadKind.IMAGE) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return `Invalid image type. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        return `Image too large. Maximum size: ${MAX_IMAGE_SIZE / 1024 / 1024}MB`;
      }
    } else {
      if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
        return `Invalid audio type. Allowed: ${ALLOWED_AUDIO_TYPES.join(', ')}`;
      }
      if (file.size > MAX_AUDIO_SIZE) {
        return `Audio too large. Maximum size: ${MAX_AUDIO_SIZE / 1024 / 1024}MB`;
      }
    }
    return null;
  }

  // Get file dimensions for images
  async function getImageDimensions(
    file: File,
  ): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        resolve({ width: 0, height: 0 });
      };
      img.src = URL.createObjectURL(file);
    });
  }

  // Get audio duration
  async function getAudioDuration(file: File): Promise<number> {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.onloadedmetadata = () => {
        resolve(Math.round(audio.duration));
      };
      audio.onerror = () => {
        resolve(0);
      };
      audio.src = URL.createObjectURL(file);
    });
  }

  // Get presigned URL from backend
  async function getPresignedUrl(
    presign: PresignUpload,
  ): Promise<PresignResponse> {
    const { data } = await api.post<PresignResponse>('/media/presign', presign);
    return data;
  }

  // Upload file to S3
  async function uploadToS3(
    file: File,
    presignData: PresignResponse,
    onProgress?: (progress: number) => void,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = Math.round((e.loaded / e.total) * 100);
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open(presignData.method, presignData.uploadUrl);

      Object.entries(presignData.headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });

      xhr.send(file);
    });
  }

  // Attach media to journal entry
  async function attachMediaToEntry(
    entryId: string,
    mediaData: AttachUploadedMedia,
  ): Promise<MediaObject> {
    const { data } = await api.post<MediaObject>(
      `/journals/entries/${entryId}/media`,
      mediaData,
    );
    return data;
  }

  // Main upload function
  async function uploadFile(
    file: File,
    kind: UploadKind,
    entryId?: string,
  ): Promise<MediaObject> {
    const validationError = validateFile(file, kind);
    if (validationError) {
      throw new Error(validationError);
    }

    // Create media object
    const mediaObj: MediaObject = {
      kind: kind as 'IMAGE' | 'AUDIO',
      url: '',
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      uploadProgress: 0,
      isUploading: true,
    };

    // Add to queue
    uploadQueue.value.push(mediaObj);

    try {
      isUploading.value = true;
      error.value = null;

      // Get metadata
      if (kind === UploadKind.IMAGE) {
        const dimensions = await getImageDimensions(file);
        mediaObj.width = dimensions.width;
        mediaObj.height = dimensions.height;
      } else if (kind === UploadKind.AUDIO) {
        const duration = await getAudioDuration(file);
        mediaObj.durationS = duration;
      }

      // Get presigned URL
      const presignData = await getPresignedUrl({
        kind,
        contentType: file.type,
        size: file.size,
      });

      // Upload to S3
      await uploadToS3(file, presignData, (progress) => {
        mediaObj.uploadProgress = progress;
      });

      // Update media object
      mediaObj.url = presignData.publicUrl;
      mediaObj.isUploading = false;
      mediaObj.uploadProgress = 100;

      if (entryId) {
        const attachData: AttachUploadedMedia = {
          key: presignData.key,
          width: mediaObj.width,
          height: mediaObj.height,
          durationS: mediaObj.durationS,
        };

        const attached = await attachMediaToEntry(entryId, attachData);
        Object.assign(mediaObj, attached);
      }

      // Move from queue to uploaded
      const index = uploadQueue.value.indexOf(mediaObj);
      if (index > -1) {
        uploadQueue.value.splice(index, 1);
      }
      uploadedMedia.value.push(mediaObj);

      return mediaObj;
    } catch (err: any) {
      mediaObj.isUploading = false;
      mediaObj.error = err.message || 'Upload failed';
      throw err;
    } finally {
      isUploading.value = uploadQueue.value.some((m) => m.isUploading);
    }
  }

  // Upload multiple files
  async function uploadMultiple(
    files: FileList | File[],
    kind: UploadKind,
    entryId?: string,
  ): Promise<MediaObject[]> {
    const filesArray = Array.from(files);
    const results: MediaObject[] = [];

    for (const file of filesArray) {
      try {
        const result = await uploadFile(file, kind, entryId);
        results.push(result);
      } catch (err) {
        console.error(`Failed to upload ${file.name}:`, err);
      }
    }

    return results;
  }

  function clearUploads() {
    uploadQueue.value = [];
    uploadedMedia.value = [];
    error.value = null;
  }

  function removeFromQueue(media: MediaObject) {
    const index = uploadQueue.value.indexOf(media);
    if (index > -1) {
      uploadQueue.value.splice(index, 1);
    }
  }

  return {
    // State
    uploadQueue,
    uploadedMedia,
    isUploading,
    error,

    // Actions
    uploadFile,
    uploadMultiple,
    validateFile,
    clearUploads,
    removeFromQueue,

    // Constants
    MAX_IMAGE_SIZE,
    MAX_AUDIO_SIZE,
    ALLOWED_IMAGE_TYPES,
    ALLOWED_AUDIO_TYPES,
  };
});
