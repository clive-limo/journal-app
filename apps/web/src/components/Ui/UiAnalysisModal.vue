<script lang="ts" setup>
import { ref, onMounted, computed, watch, type PropType } from 'vue';
import UiButton from '@/components/Ui/UiButton.vue';
import Text from '@/components/Typography/Text.vue';
import {
  X,
  Sparkles,
  TrendingUp,
  Heart,
  Brain,
  Target,
  BookOpen,
  AlertOctagon,
  Share2,
  Download,
} from 'lucide-vue-next';
import { useAIReflectionStore, type AIAnalysis } from '@/stores/reflections';
import type { EntryKind } from '@/utils/types';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  entrySummary: {
    type: String,
    required: true,
  },
  entryKind: {
    type: String as PropType<EntryKind>,
    required: true,
  },
  analysis: {
    type: Object,
    required: true,
  },
  onClose: {
    type: Function,
    required: true,
  },
});

// Animation states
const isVisible = ref(false);
const currentSection = ref(0);
const isAnalyzing = ref(true);
const showContent = ref(false);

// Mock analysis data structure
const analysisData = ref<AIAnalysis | null>(null);
// Animation sequence
const sections = [
  { icon: Brain, title: 'Analyzing Content', delay: 0 },
  { icon: Heart, title: 'Understanding Emotions', delay: 800 },
  { icon: TrendingUp, title: 'Identifying Patterns', delay: 1600 },
  { icon: Target, title: 'Generating Insights', delay: 2400 },
];

const aiStore = useAIReflectionStore();

const getEntryContent = () => {
  const entryContent = [props.entrySummary];
  aiStore.chatMessages.forEach((msg) => {
    entryContent.push(msg.content || '');
  });
  return entryContent.join(' ');
};

const startAnalysis = async () => {
  isAnalyzing.value = true;
  showContent.value = false;

  let i = 0;
  const intervalId = setInterval(() => {
    currentSection.value = i;
    i = (i + 1) % sections.length;
  }, 1000);

  const entryContent = getEntryContent();

  try {
    const analysis = await aiStore.generateEntryAnalysis(
      entryContent,
      props.entryKind,
    );
    analysisData.value = analysis;
  } catch (error) {
    console.log(error);
  } finally {
    clearInterval(intervalId);
    isAnalyzing.value = false;
    showContent.value = true;
  }
};

const closePopup = () => {
  isVisible.value = false;
  aiStore.clearChat();
  setTimeout(() => {
    props.onClose();
  }, 300);
};

const shareAnalysis = () => {
  // Implement sharing functionality
  console.log('Sharing analysis...');
};

const downloadAnalysis = () => {
  // Implement download functionality
  console.log('Downloading analysis...');
};

const getMoodColor = (score: number) => {
  if (score >= 8) return 'from-green-400 to-emerald-500';
  if (score >= 6) return 'from-blue-400 to-cyan-500';
  if (score >= 4) return 'from-yellow-400 to-orange-500';
  return 'from-red-400 to-pink-500';
};

watch(
  () => props.isOpen,
  (isOpen) => {
    if (props.isOpen) {
      setTimeout(() => {
        isVisible.value = true;
        startAnalysis();
      }, 100);
    }
  },
);

onMounted(() => {
  if (props.isOpen) {
    setTimeout(() => {
      isVisible.value = true;
      startAnalysis();
    }, 100);
  }
});
</script>

<template>
  <!-- Backdrop -->
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click="closePopup"
    >
      <!-- Popup Container -->
      <Transition name="scale-slide">
        <div
          v-if="isVisible"
          class="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-[32px] border-4 border-black/10 shadow-2xl overflow-hidden"
          @click.stop
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between p-6 border-b border-black/10 bg-gradient-to-r from-orange-50 to-orange-100"
          >
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-full bg-orange-200/50">
                <Sparkles class="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <Text variant="title" size="lg">Entry Analysis</Text>
                <Text variant="body" size="sm" class="text-black/60">
                  AI-powered insights from your journal entry
                </Text>
              </div>
            </div>

            <UiButton
              :has-icon="true"
              icon-location="after"
              @click="closePopup"
              class="rounded-full h-10 w-10 hover:bg-orange-100"
            >
              <template #icon>
                <X class="w-5 h-5" />
              </template>
            </UiButton>
          </div>

          <!-- Analysis Loading State -->
          <Transition name="fade" mode="out-in">
            <div
              v-if="isAnalyzing"
              class="flex flex-col items-center justify-center p-12 gap-8 min-h-[400px]"
            >
              <div class="relative">
                <!-- Pulsing analysis icon -->
                <div
                  class="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center animate-pulse"
                >
                  <component
                    :is="sections[currentSection]?.icon || Brain"
                    class="w-12 h-12 text-white"
                  />
                </div>

                <!-- Rotating ring -->
                <div
                  class="absolute inset-0 border-4 border-transparent border-t-orange-300 rounded-full animate-spin"
                />
              </div>

              <div class="text-center">
                <Text variant="title" size="md" class="mb-2">
                  {{ sections[currentSection]?.title || 'Analyzing...' }}
                </Text>
                <Text variant="body" size="sm" class="text-black/60">
                  This may take a few moments
                </Text>
              </div>

              <!-- Progress dots -->
              <div class="flex gap-2">
                <div
                  v-for="(section, index) in sections"
                  :key="index"
                  class="w-2 h-2 rounded-full transition-all duration-300"
                  :class="
                    index <= currentSection ? 'bg-orange-400' : 'bg-orange-200'
                  "
                />
              </div>
            </div>

            <!-- Analysis Results -->
            <div
              v-else-if="showContent && analysisData"
              class="overflow-y-auto max-h-[calc(90vh-120px)]"
            >
              <div class="p-6 flex flex-col gap-4">
                <!-- Mood Analysis -->
                <div
                  class="p-6 rounded-[24px] border-2 border-black/10 bg-gradient-to-br from-orange-50 to-orange-100"
                >
                  <div class="flex items-center gap-3 mb-4">
                    <Heart class="w-6 h-6 text-orange-600" />
                    <Text variant="title" size="md">Mood Analysis</Text>
                  </div>

                  <div class="flex items-center gap-6">
                    <div class="relative w-24 h-24">
                      <div
                        class="absolute inset-0 rounded-full bg-gradient-to-r bg-gray-200"
                      />
                      <div
                        class="absolute inset-0 rounded-full bg-gradient-to-r"
                        :class="getMoodColor(analysisData.mood.score)"
                        :style="{
                          background: `conic-gradient(from 0deg, orange 0deg, orange ${analysisData.mood.score * 36}deg, transparent ${analysisData.mood.score * 36}deg)`,
                        }"
                      />
                      <div
                        class="absolute inset-2 rounded-full bg-white flex items-center justify-center"
                      >
                        <Text variant="title" size="sm"
                          >{{ analysisData.mood.score }}/10</Text
                        >
                      </div>
                    </div>

                    <div class="flex-1">
                      <Text variant="title" size="md" class="mb-1">
                        {{ analysisData.mood.primary }}
                      </Text>
                      <Text variant="body" size="sm" class="text-black/70 mb-2">
                        with touches of {{ analysisData.mood.secondary }}
                      </Text>
                      <div class="flex gap-2">
                        <span
                          class="px-2 py-1 bg-orange-200/50 rounded-full text-xs"
                        >
                          Positive outlook
                        </span>
                        <span
                          class="px-2 py-1 bg-blue-200/50 rounded-full text-xs"
                        >
                          Self-aware
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Key Themes -->
                <div
                  class="p-6 rounded-[24px] border-2 border-black/10 bg-white"
                >
                  <div class="flex items-center gap-3 mb-6">
                    <Target class="w-6 h-6 text-orange-600" />
                    <Text variant="title" size="md">Key Themes</Text>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      v-for="(theme, index) in analysisData.themes"
                      :key="index"
                      class="flex items-center justify-between p-4 rounded-xl bg-orange-50"
                    >
                      <Text variant="body" size="sm">{{ theme.name }}</Text>
                      <div class="flex items-center gap-2">
                        <div
                          class="w-16 h-2 bg-orange-200 rounded-full overflow-hidden"
                        >
                          <div
                            class="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-1000"
                            :style="{ width: `${theme.strength}%` }"
                          />
                        </div>
                        <Text variant="body" size="sm" class="text-black/60">
                          {{ theme.strength }}%
                        </Text>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Insights -->
                <div
                  class="p-6 rounded-[24px] border-2 border-black/10 bg-gradient-to-br from-blue-50 to-blue-100"
                >
                  <div class="flex items-center gap-3 mb-6">
                    <Brain class="w-6 h-6 text-blue-600" />
                    <Text variant="title" size="md">Key Insights</Text>
                  </div>

                  <div class="flex flex-col gap-2">
                    <div
                      v-for="(insight, index) in analysisData.insights"
                      :key="index"
                      class="flex items-start gap-3 p-4 bg-white/70 rounded-xl"
                    >
                      <div
                        class="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5"
                      >
                        <Text variant="body" size="sm">{{ index + 1 }}</Text>
                      </div>
                      <Text variant="body" size="sm">{{ insight }}</Text>
                    </div>
                  </div>
                </div>

                <!-- Writing Patterns -->
                <div
                  class="p-6 rounded-[24px] border-2 border-black/10 bg-white"
                >
                  <div class="flex items-center gap-3 mb-6">
                    <TrendingUp class="w-6 h-6 text-orange-600" />
                    <Text variant="title" size="md">Writing Patterns</Text>
                  </div>

                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="text-center p-4 rounded-xl bg-orange-50">
                      <Text variant="body" size="sm" class="text-black/60 mb-1"
                        >Writing Time</Text
                      >
                      <Text variant="title" size="sm">{{
                        analysisData.patterns.writingTime
                      }}</Text>
                    </div>
                    <div class="text-center p-4 rounded-xl bg-orange-50">
                      <Text variant="body" size="sm" class="text-black/60 mb-1"
                        >Word Count</Text
                      >
                      <Text variant="title" size="sm">{{
                        analysisData.patterns.wordCount
                      }}</Text>
                    </div>
                    <div class="text-center p-4 rounded-xl bg-orange-50">
                      <Text variant="body" size="sm" class="text-black/60 mb-1"
                        >Sentiment</Text
                      >
                      <Text variant="title" size="sm">{{
                        analysisData.patterns.sentiment
                      }}</Text>
                    </div>
                    <div class="text-center p-4 rounded-xl bg-orange-50">
                      <Text variant="body" size="sm" class="text-black/60 mb-1"
                        >Frequency</Text
                      >
                      <Text variant="title" size="sm">{{
                        analysisData.patterns.frequency
                      }}</Text>
                    </div>
                  </div>
                </div>

                <!-- Suggestions -->
                <div
                  class="p-6 rounded-[24px] border-2 border-black/10 bg-gradient-to-br from-green-50 to-green-100"
                >
                  <div class="flex items-center gap-3 mb-6">
                    <BookOpen class="w-6 h-6 text-green-600" />
                    <Text variant="title" size="md"
                      >Suggestions for Next Entry</Text
                    >
                  </div>

                  <div class="flex flex-col gap-2">
                    <div
                      v-for="(suggestion, index) in analysisData.suggestions"
                      :key="index"
                      class="p-4 bg-white/70 rounded-xl border-l-4 border-green-400"
                    >
                      <Text variant="body" size="sm">{{ suggestion }}</Text>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Error State -->
            <div
              v-else
              class="flex flex-col items-center justify-center p-6 border-t border-black/10 bg-orange-50/50"
            >
              <div class="flex items-center gap-3 mb-3">
                <AlertOctagon class="w-6 h-6 text-orange-600" />
                <Text variant="title" size="md">Error</Text>
              </div>
              <Text variant="body" size="sm" class="text-black/60">
                Something went wrong and we couldn't generate analysis for this
                entry. Please try again later.
              </Text>
            </div>
          </Transition>

          <!-- Footer Actions -->
          <div
            v-if="showContent"
            class="flex items-center justify-between p-6 border-t border-black/10 bg-orange-50/50"
          >
            <Text variant="body" size="sm" class="text-black/60">
              Analysis generated by AI • Keep journaling to improve insights
            </Text>

            <div class="flex gap-3">
              <UiButton
                :has-icon="true"
                icon-location="before"
                @click="shareAnalysis"
              >
                <template #icon>
                  <Share2 class="w-4 h-4" />
                </template>
                <Text variant="body" size="sm">Share</Text>
              </UiButton>

              <UiButton
                :has-icon="true"
                icon-location="before"
                @click="downloadAnalysis"
              >
                <template #icon>
                  <Download class="w-4 h-4" />
                </template>
                <Text variant="body" size="sm">Export</Text>
              </UiButton>

              <UiButton
                :has-icon="false"
                :is-primary="true"
                @click="closePopup"
              >
                <Text variant="subtitle" size="button"
                  >Continue Journaling</Text
                >
              </UiButton>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>
/* Transition animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-slide-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.scale-slide-leave-active {
  transition: all 0.3s ease-in;
}

.scale-slide-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

.scale-slide-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}

/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #fb923c;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #ea580c;
}
</style>
