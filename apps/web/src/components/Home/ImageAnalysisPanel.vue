<script lang="ts" setup>
import { computed } from 'vue';
import Text from '@/components/Typography/Text.vue';
import UiButton from '@/components/Ui/UiButton.vue';
import {
  Brain,
  Palette,
  Target,
  Lightbulb,
  BarChart3,
  Sparkles,
  X,
} from 'lucide-vue-next';
import type { ImageAnalysisResult } from '@/utils/types';

const props = defineProps<{
  analysis: ImageAnalysisResult | null;
  isLoading: boolean;
  onClose?: () => void;
}>();

const contextAlignmentColor = computed(() => {
  if (!props.analysis) return 'text-gray-500';
  const score = props.analysis.contextAlignment.score;
  if (score >= 8) return 'text-green-600';
  if (score >= 6) return 'text-yellow-600';
  return 'text-red-600';
});

const contextAlignmentBg = computed(() => {
  if (!props.analysis) return 'bg-gray-100';
  const score = props.analysis.contextAlignment.score;
  if (score >= 8) return 'bg-green-100';
  if (score >= 6) return 'bg-yellow-100';
  return 'bg-red-100';
});
</script>

<template>
  <div
    class="h-full bg-white rounded-3xl border border-gray-200 overflow-hidden"
  >
    <!-- Header -->
    <div
      class="flex flex-row items-center justify-between bg-gradient-to-r from-[#F1ACB4] to-orange-500 p-4 text-white relative"
    >
      <div class="flex items-center gap-2">
        <Brain class="w-5 h-5" />
        <Text variant="subtitle" size="md" class="text-white font-medium">
          Drawing Analysis
        </Text>
      </div>

      <UiButton
        v-if="onClose"
        :has-icon="true"
        icon-location="after"
        @click="onClose"
      >
        <template #icon>
          <X color="black" :size="12" />
        </template>
      </UiButton>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="p-6 space-y-4">
      <div class="flex items-center justify-center py-8">
        <div class="relative">
          <div
            class="w-14 h-14 flex flex-row items-center justify-center border-2 border-[#F1ACB4] rounded-full animate-spin border-t-purple-500"
          >
            <Sparkles class="w-8 h-8 text-[#F1ACB4] animate-pulse" />
          </div>
        </div>
      </div>
      <Text variant="body" size="sm" class="text-center text-gray-600">
        Analyzing your drawing...
      </Text>
    </div>

    <!-- No Analysis State -->
    <div
      v-else-if="!analysis"
      class="p-6 flex flex-col gap-4 items-center justify-center text-center"
    >
      <Brain class="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <Text variant="body" size="sm" class="text-gray-500">
        Complete your drawing and click "Analyze Drawing" to see insights
      </Text>
    </div>

    <!-- Analysis Results -->
    <div
      v-else
      class="p-6 flex flex-col gap-4 space-y-6 overflow-auto"
      style="max-height: calc(100vh - 300px)"
    >
      <!-- Context Alignment Score -->
      <div class="space-y-3">
        <div class="flex items-center gap-2">
          <Target class="w-4 h-4 text-gray-600" />
          <Text variant="subtitle" size="lg" class="font-bold">
            Context Alignment
          </Text>
        </div>

        <div :class="`p-3 rounded-xl ${contextAlignmentBg}`">
          <div class="flex items-center justify-between mb-2">
            <Text :class="`font-bold text-lg ${contextAlignmentColor}`">
              {{ analysis.contextAlignment.score }}/10
            </Text>
            <BarChart3 :class="`w-4 h-4 ${contextAlignmentColor}`" />
          </div>
          <Text variant="body" size="sm" class="text-gray-700">
            {{ analysis.contextAlignment.observations.join(', \n ') }}
          </Text>
        </div>
      </div>

      <!-- Color Analysis -->
      <div class="space-y-3">
        <div class="flex items-center gap-2">
          <Palette class="w-4 h-4 text-gray-600" />
          <Text variant="subtitle" size="md" class="font-medium">
            Color & Emotion
          </Text>
        </div>

        <div class="space-y-2">
          <div
            v-for="color in analysis.colors"
            :key="color.name"
            class="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
          >
            <div
              class="w-4 h-4 rounded-full border border-gray-300"
              :style="{ backgroundColor: '#ffffff20' }"
            ></div>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <Text variant="body" size="sm" class="font-medium capitalize">
                  {{ color.name }}
                </Text>
                <Text variant="body" size="lg" class="text-gray-500">
                  {{ Math.round(color.dominance) }}%
                </Text>
              </div>
              <Text variant="body" size="sm" class="text-gray-600 capitalize">
                {{ color.emotion }}
              </Text>
            </div>
          </div>
        </div>
      </div>

      <!-- Insights -->
      <div class="space-y-3">
        <div class="flex items-center gap-2">
          <Lightbulb class="w-4 h-4 text-gray-600" />
          <Text variant="subtitle" size="lg" class="font-medium">
            Key Insights
          </Text>
        </div>

        <div class="flex flex-col gap-2">
          <div
            v-for="(insight, index) in analysis.insights"
            :key="index"
            class="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400"
          >
            <Text variant="body" size="sm" class="text-blue-800">
              {{ insight }}
            </Text>
          </div>
        </div>
      </div>

      <!-- Suggestions (if available) -->
      <!-- <div v-if="analysis.suggestions?.length" class="space-y-3">
        <div class="flex items-center gap-2">
          <Sparkles class="w-4 h-4 text-gray-600" />
          <Text variant="subtitle" size="sm" class="font-medium">
            Suggestions
          </Text>
        </div>
        
        <div class="space-y-2">
          <div 
            v-for="(suggestion, index) in analysis.suggestions" 
            :key="index"
            class="p-3 bg-green-50 rounded-lg"
          >
            <Text variant="body" size="sm" class="text-green-800">
              {{ suggestion }}
            </Text>
          </div>
        </div>
      </div> -->
    </div>
  </div>
</template>

<style scoped>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
