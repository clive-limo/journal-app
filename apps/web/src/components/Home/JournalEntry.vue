<script setup lang="ts">
import { ref, computed } from 'vue';
import UiButton from '@/components/Ui/UiButton.vue';
import Text from '@/components/Typography/Text.vue';
import { Delete, Save, Sparkles, Trash2 } from 'lucide-vue-next';
import WritingEntry from './WritingEntry.vue';
import TalkingEntry from './TalkingEntry.vue';
import DrawingEntry from './DrawingEntry.vue';
import UiAnalysisModal from '../Ui/UiAnalysisModal.vue';
import { useAuthStore } from '@/stores/auth';
import { EntryKind, type Entry } from '@/utils/types';
import { useJournalStore } from '@/stores/journal';
import router from '@/router';

const props = defineProps({
  entryType: {
    type: String,
    required: true,
  },
});

const emits = defineEmits(['closeEntry']);

const entryBody = ref('');
const isReflecting = ref(true);
const showAnalysisModal = ref(false);

const charactersCount = computed(() => entryBody.value.length);
const entryKind = computed<EntryKind>(() => {
  const entryKind = {
    write: EntryKind.WRITE,
    talk: EntryKind.TALK,
    draw: EntryKind.DRAW,
  }[props.entryType] as EntryKind;

  return entryKind;
});

const authStore = useAuthStore();
const journalStore = useJournalStore();

const today = computed(() => {
  const date = new Date();
  const day = date.toLocaleString('default', { weekday: 'long' });
  const month = date.toLocaleString('default', { month: 'long' });
  const dayNumber = date.toLocaleString('default', { day: 'numeric' });
  return `${day}, ${month} ${dayNumber}`;
});

const updateEntry = (text: string) => {
  entryBody.value = text;
};

const handleSaveEntry = async () => {
  if (!authStore.user) {
    return;
  }

  const data: Partial<Entry> = {
    kind: entryKind.value,
    body: entryBody.value,
  };

  try {
    await journalStore.createEntry(authStore.user.defaultJournal!.id, data);
  } catch (error) {
    console.log(error);
  } finally {
    showAnalysisModal.value = true;
  }
};
</script>

<template>
  <div class="flex-1 w-full flex flex-col gap-4">
    <!-- analysis popup -->
    <UiAnalysisModal
      :is-open="showAnalysisModal"
      :entry-summary="entryBody"
      :entry-kind="entryKind"
      :analysis="{}"
      :on-close="
        () => {
          showAnalysisModal = false;
          entryBody = '';
          emits('closeEntry');
        }
      "
    />
    <Text variant="title" size="xl"
      ><p>
        New Journal <br />
        Entry
      </p></Text
    >
    <Text variant="subtitle" size="md"
      ><p>
        {{ today }}
      </p></Text
    >

    <WritingEntry
      v-if="props.entryType === 'write'"
      @update-entry="updateEntry"
      @save="handleSaveEntry"
      @discard="() => {}"
    />

    <TalkingEntry
      v-if="props.entryType === 'talk'"
      @save="handleSaveEntry"
      @discard="() => {}"
    />

    <DrawingEntry
      v-if="props.entryType === 'draw'"
      @save="handleSaveEntry"
      @discard="() => {}"
    />

    <div class="flex flex-row items-center justify-between">
      <Text variant="body" size="sm" class="text-black/50">
        {{ charactersCount }} characters
      </Text>
      <div class="flex flex-row gap-8">
        <UiButton :has-icon="true" icon-location="after" @click="() => {}">
          <template #icon>
            <Trash2 />
          </template>
          <p>Discard</p>
        </UiButton>
        <UiButton
          :has-icon="true"
          :is-primary="true"
          icon-location="after"
          @click="handleSaveEntry"
        >
          <template #icon>
            <Save />
          </template>
          <p>Save Your Entry</p>
        </UiButton>
      </div>
    </div>
  </div>
</template>
