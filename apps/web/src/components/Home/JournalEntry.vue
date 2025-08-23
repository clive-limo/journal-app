<script setup lang="ts">
import { ref, computed } from 'vue';
import UiButton from '@/components/Ui/UiButton.vue';
import Text from '@/components/Typography/Text.vue';
import { Delete, Save, Sparkles, Trash2 } from 'lucide-vue-next';
import WritingEntry from './WritingEntry.vue';
import TalkingEntry from './TalkingEntry.vue';
import DrawingEntry from './DrawingEntry.vue';

const props = defineProps({
  entryType: {
    type: String,
    required: true,
  },
});

const entryBody = ref('');
const isReflecting = ref(true);

const charactersCount = computed(() => entryBody.value.length);

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
  //   await createEntry({
  //     body: entryBody.value.trim(),
  //   });
  entryBody.value = '';
};
</script>

<template>
  <div class="flex-1 w-full flex flex-col gap-4">
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
      @on-change="updateEntry"
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
          @click="() => {}"
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
