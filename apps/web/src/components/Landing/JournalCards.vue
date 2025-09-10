<template>
  <div
    class="shadow-md h-[300px] w-[300px] rounded-[50px] overflow-hidden"
    :style="{ backgroundColor: color }"
  >
    <div class="p-4 text-left">
      <Text
        variant="title"
        size="lg"
        :class="daysCount > 20 ? 'text-[#FEF6E6]' : 'text-black'"
      >
        {{ title }}
      </Text>
      <Text
        variant="body"
        size="sm"
        :class="daysCount > 20 ? 'text-[#BEBEBE]' : 'text-black'"
      >
        {{ daysCount }} DAYS AGO
      </Text>
    </div>
    <div>
      <img :src="imageSrc" alt="" class="w-full h-48 object-cover" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Text from '../Typography/Text.vue';

defineProps<{
  title: string;
  daysCount: number;
  imageSrc: string;
  color: string;
}>();
</script>
