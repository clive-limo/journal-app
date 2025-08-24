<script lang="ts" setup>
import { ref, computed } from 'vue';
import UiButton from '@/components/Ui/UiButton.vue';
import ReflectionPanel from './ReflectionPanel.vue';
import Text from '@/components/Typography/Text.vue';
import { Sparkles } from 'lucide-vue-next';
import { EntryKind } from '@/utils/types';

const props = defineProps({
  onSave: {
    type: Function,
    required: true,
  },
  onDiscard: {
    type: Function,
    required: true,
  },
});

const entryBody = ref('');

const emit = defineEmits<{
  (e: 'updateEntry', value: string): void;
}>();

const onInput = (e: Event) => {
  const target = e.target as HTMLTextAreaElement;
  emit('updateEntry', entryBody.value);
};
</script>

<template>
  <div class="flex-1 flex flex-row gap-4">
    <!-- Textarea -->
    <textarea
      v-model="entryBody"
      class="flex-1 p-8 rounded-[50px] text-xl text-black/50 font-firacode resize-none border-4 border-black/10 bg-orange-200/20 backdrop-blur-md focus:outline-none focus:border-black/10 focus:ring-2 focus:ring-black/10 transition-all duration-300"
      placeholder="Write something..."
      @input="onInput"
    ></textarea>

    <!-- Reflections panel -->
    <ReflectionPanel :entry-content="entryBody" :entry-type="EntryKind.WRITE" />
  </div>
</template>
