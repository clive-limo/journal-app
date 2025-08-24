<template>
  <div class="relative w-fit flex flex-col">
    <button
      class="flex items-center z-10 overflow-clip py-2 border-2 gap-3 border-black rounded-xl transition-transform duration-300 ease-out active:translate-x-1 active:translate-y-1"
      :class="isPrimary ? 'bg-orange-500 px-10' : 'bg-white px-4'"
      :disabled="loading"
      @click="handleClick"
    >
      <template v-if="!loading && hasIcon && iconLocation === 'before'">
        <slot name="icon" />
      </template>
      <span v-if="!loading" class="mx-2"><slot /></span>
      <template v-if="!loading && hasIcon && iconLocation === 'after'">
        <slot name="icon" />
      </template>
      <div v-if="loading" class="inset-0 flex items-center justify-center">
        <Text
          variant="subtitle"
          size="button"
          :class="isPrimary ? 'text-black' : 'text-orange-500'"
          >Loading...</Text
        >
        <div
          class="h-5 w-5 border-b-2 rounded-full animate-spin"
          :class="isPrimary ? 'border-black' : 'border-orange-500'"
        ></div>
      </div>
    </button>
    <div
      class="absolute top-1 left-1 h-full w-full rounded-xl bg-black transition-transform duration-300 ease-out active:translate-x-1 active:translate-y-1"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Text from '../Typography/Text.vue';

const props = defineProps<{
  onClick: () => void;
  hasIcon?: boolean;
  iconLocation?: 'before' | 'after';
  delay?: number;
  isPrimary?: boolean;
}>();

const loading = ref(false);

const handleClick = async () => {
  loading.value = true;
  console.log('clicked');
  try {
    await props.onClick();
  } finally {
    loading.value = false;
  }
};
</script>
