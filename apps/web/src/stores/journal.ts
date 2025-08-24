// stores/journalStore.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/lib/axios';
import type { Entry, Journal, Media, UploadKind } from '@/utils/types';

export const useJournalStore = defineStore('journal', () => {
  // --- state ---
  const journals = ref<Journal[]>([]);
  const entries = ref<Entry[]>([]);
  const media = ref<Media[]>([]);
  const loading = ref(false);

  // --- actions ---

  // Entries
  const createEntry = async (journalId: string, payload: Partial<Entry>) => {
    const { data } = await api.post<Entry>(
      `/journals/${journalId}/entries`,
      payload,
    );
    entries.value.push(data);
    return data;
  };

  const fetchEntries = async (journalId: string) => {
    const { data } = await api.get<Entry[]>(
      `/api/journals/${journalId}/entries`,
    );
    entries.value = data;
    return data;
  };

  // Media
  const attachMedia = async (
    journalId: string,
    entryId: string,
    file: File,
    kind: UploadKind,
  ) => {
    // Get presigned URL
    const { data } = await api.post<{ url: string; mediaId: string }>(
      `/api/journals/${journalId}/entries/${entryId}/media/attach`,
      {
        kind,
        contentType: file.type,
        fileName: file.name,
        size: file.size,
      },
    );

    // Upload directly to bucket/storage
    await fetch(data.url, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    return data.mediaId;
  };

  const fetchMedia = async (journalId: string, entryId: string) => {
    const { data } = await api.get<Media[]>(
      `/api/journals/${journalId}/entries/${entryId}/media`,
    );
    media.value = data;
    return data;
  };

  const deleteMedia = async (
    journalId: string,
    entryId: string,
    mediaId: string,
  ) => {
    await api.delete(
      `/api/journals/${journalId}/entries/${entryId}/media/${mediaId}`,
    );
    media.value = media.value.filter((m) => m.id !== mediaId);
  };

  return {
    journals,
    entries,
    media,
    loading,
    createEntry,
    fetchEntries,
    attachMedia,
    fetchMedia,
    deleteMedia,
  };
});
