<template>
  <component :is="tag" :class="computedClasses" v-bind="$attrs">
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type VariantType = 'title' | 'subtitle' | 'body' | 'fira-bold';
type SizeType = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'button';

interface Props {
  variant?: VariantType;
  size?: SizeType;
  tag?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'title',
  size: 'md',
});

// Size configurations for each variant
const variantSizes: Record<VariantType, Record<SizeType, string>> = {
  title: {
    sm: 'font-playfair text-xl font-semibold leading-tight',
    md: 'font-playfair text-2xl font-semibold leading-tight',
    lg: 'font-playfair text-3xl font-bold leading-tight',
    xl: 'font-playfair sm:text-5xl md:text-6xl font-bold leading-tight',
    '2xl': 'font-playfair sm:text-5xl md:text-[72px] font-bold leading-tight',
    button: 'font-firacode text-xl font-medium text-gray-600 leading-relaxed',
  },
  subtitle: {
    sm: 'font-firacode text-sm font-medium text-gray-600 leading-normal',
    md: 'font-firacode text-base font-medium text-gray-600 leading-normal',
    lg: 'font-firacode text-lg font-medium text-gray-600 leading-relaxed',
    xl: 'font-firacode text-xl font-medium text-gray-600 leading-relaxed',
    '2xl': 'font-playfair sm:text-5xl md:text-[72px] font-bold leading-tight',
    button: 'font-firacode text-base font-bold text-black leading-relaxed',
  },
  body: {
    sm: 'font-firacode text-sm font-medium text-gray-600 leading-normal',
    md: 'font-firacode text-base font-medium text-gray-600 leading-normal',
    lg: 'font-firacode text-lg font-medium text-gray-600 leading-relaxed',
    xl: 'font-firacode text-xl font-medium text-gray-600 leading-relaxed',
    '2xl': 'font-playfair sm:text-5xl md:text-[72px] font-bold leading-tight',
    button: 'font-firacode text-xl font-medium text-gray-600 leading-relaxed',
  },
  'fira-bold': {
    sm: 'font-firacode text-sm font-bold  leading-normal',
    md: 'font-firacode text-base font-bold  leading-normal',
    lg: 'font-firacode text-lg font-bold  leading-relaxed',
    xl: 'font-firacode text-xl font-bold  leading-relaxed',
    '2xl': 'font-firacode sm:text-5xl md:text-[72px] font-bold leading-tight',
    button: 'font-firacode text-xl font-bold leading-relaxed',
  },
};

// Default tags for each variant
const defaultTags: Record<VariantType, string> = {
  title: 'h2',
  subtitle: 'p',
  body: 'p',
  'fira-bold': 'p',
};

const computedClasses = computed((): string => {
  return variantSizes[props.variant][props.size];
});

const tag = computed((): string => {
  return props.tag || defaultTags[props.variant];
});
</script>
