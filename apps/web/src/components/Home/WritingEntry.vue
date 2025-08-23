<script lang="ts" setup>
import { ref, computed } from 'vue';
import UiButton from '@/components/Ui/UiButton.vue';
import Text from '@/components/Typography/Text.vue';
import { Save } from 'lucide-vue-next';

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

defineEmits(['updateEntry']);
</script>

<template>
  <div class="flex-1 flex flex-row gap-4">
    <!-- Textarea -->
    <textarea
      v-model="entryBody"
      class="flex-1 p-8 rounded-[50px] text-xl text-black/50 font-firacode resize-none border-4 border-black/10 bg-orange-200/20 backdrop-blur-md focus:outline-none focus:border-black/10 focus:ring-2 focus:ring-black/10 transition-all duration-300"
      placeholder="Write something..."
      @input="$emit('updateEntry', entryBody)"
    ></textarea>

    <!-- Reflections panel -->
    <transition name="fade-slide">
      <div
        class="flex-[0.5] flex flex-col p-8 rounded-[50px] border-4 border-black/10 bg-orange-200/20 backdrop-blur-md"
      >
        <div
          class="flex-1 flex flex-col items-center justify-center text-center gap-4"
        >
          <Text variant="title" size="lg"> Reflection </Text>
          <Text variant="body" size="sm" class="w-2/3"
            >Step back and take a closer look at your entry — with a little help
            from AI to spot patterns and insights...</Text
          >
          <UiButton
            :has-icon="true"
            :is-primary="true"
            icon-location="after"
            @click="() => {}"
          >
            <template #icon>
              <Sparkles />
            </template>
            <p>Start</p>
          </UiButton>
        </div>
      </div>
    </transition>
  </div>
</template>
