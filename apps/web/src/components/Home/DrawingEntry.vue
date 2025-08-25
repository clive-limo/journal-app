<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import UiButton from '@/components/Ui/UiButton.vue';
import Text from '@/components/Typography/Text.vue';
import {
  Palette,
  Eraser,
  RotateCcw,
  Save,
  Sparkles,
  Minus,
  Plus,
  Pencil,
  AlertTriangle,
  RefreshCw,
} from 'lucide-vue-next';
import ReflectionPanel from './ReflectionPanel.vue';
import ImageAnalysisPanel from './ImageAnalysisPanel.vue';
import { EntryKind, type ImageAnalysisResult } from '@/utils/types';
import { useAIReflectionStore } from '@/stores/reflections';

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

defineEmits(['updateEntry']);

// Canvas and drawing states
const canvas = ref<HTMLCanvasElement | null>(null);
const isDrawing = ref(false);
const hasDrawing = ref(false);
const currentColor = ref('#e74c3c');
const currentWidth = ref(3);
const isErasing = ref(false);

// Drawing context
let ctx: CanvasRenderingContext2D | null = null;
let lastX = 0;
let lastY = 0;

// Color palette
const colorPalette = [
  '#e74c3c', // red
  '#3498db', // blue
  '#2ecc71', // green
  '#f39c12', // orange
  '#9b59b6', // purple
  '#1abc9c', // teal
  '#e67e22', // dark orange
  '#34495e', // dark blue-gray
  '#f1c40f', // yellow
  '#95a5a6', // gray
  '#e91e63', // pink
  '#00bcd4', // cyan
];

// Pen width options
const penWidths = [1, 2, 3, 5, 8, 12, 16];

const initializeCanvas = () => {
  if (!canvas.value) return;

  ctx = canvas.value.getContext('2d');
  if (!ctx) return;

  // Set canvas size
  const rect = canvas.value.getBoundingClientRect();
  canvas.value.width = rect.width * window.devicePixelRatio;
  canvas.value.height = rect.height * window.devicePixelRatio;

  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  canvas.value.style.width = rect.width + 'px';
  canvas.value.style.height = rect.height + 'px';

  // Set initial drawing properties
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.value.width, canvas.value.height);
};

const getMousePos = (e: MouseEvent) => {
  if (!canvas.value) return { x: 0, y: 0 };

  const rect = canvas.value.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
};

const getTouchPos = (e: TouchEvent) => {
  if (!canvas.value) return { x: 0, y: 0 };

  const rect = canvas.value.getBoundingClientRect();
  const touch = e.touches[0] || e.changedTouches[0];
  return {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top,
  };
};

const startDrawing = (e: MouseEvent | TouchEvent) => {
  if (!ctx) return;

  isDrawing.value = true;
  hasDrawing.value = true;

  const pos = e instanceof MouseEvent ? getMousePos(e) : getTouchPos(e);
  lastX = pos.x;
  lastY = pos.y;

  // Set drawing properties
  if (isErasing.value) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = currentWidth.value * 2; // Eraser is bigger
  } else {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = currentColor.value;
    ctx.lineWidth = currentWidth.value;
  }

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
};

const draw = (e: MouseEvent | TouchEvent) => {
  if (!isDrawing.value || !ctx) return;

  const pos = e instanceof MouseEvent ? getMousePos(e) : getTouchPos(e);

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();

  lastX = pos.x;
  lastY = pos.y;
};

const stopDrawing = () => {
  if (!isDrawing.value) return;
  isDrawing.value = false;
  if (ctx) {
    ctx.beginPath();
  }
};

const selectColor = (color: string) => {
  currentColor.value = color;
  isErasing.value = false;
};

const selectWidth = (width: number) => {
  currentWidth.value = width;
};

const toggleEraser = () => {
  isErasing.value = !isErasing.value;
};

const clearCanvas = () => {
  if (!ctx || !canvas.value) return;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(
    0,
    0,
    canvas.value.width / window.devicePixelRatio,
    canvas.value.height / window.devicePixelRatio,
  );
  hasDrawing.value = false;
  // Clear analysis when canvas is cleared
  drawingAnalysis.value = null;
};

const saveDrawing = () => {
  if (!canvas.value || !hasDrawing.value) return;

  canvas.value.toBlob((blob) => {
    if (blob) {
      props.onSave(blob);
    }
  }, 'image/png');
};

const discardDrawing = () => {
  clearCanvas();
  props.onDiscard();
};

const adjustWidth = (delta: number) => {
  const currentIndex = penWidths.indexOf(currentWidth.value);
  const newIndex = Math.max(
    0,
    Math.min(penWidths.length - 1, currentIndex + delta),
  );
  currentWidth.value = penWidths[newIndex];
};

// Drawing context and analysis states
const drawingContext = ref<{
  prompt: string;
  suggestions: string[];
} | null>(null);
const drawingAnalysis = ref<ImageAnalysisResult | null>(null);
const loadingContext = ref(false);
const contextError = ref<string | null>(null);
const analyzingDrawing = ref(false);
const analysisError = ref<string | null>(null);

const aiStore = useAIReflectionStore();

const loadDrawingContext = async () => {
  loadingContext.value = true;
  contextError.value = null;

  try {
    const context = await aiStore.getDrawingContext();
    drawingContext.value = context;
  } catch (error) {
    console.error('Failed to load drawing context:', error);
    contextError.value = 'Failed to load drawing prompt. Please try again.';
  } finally {
    loadingContext.value = false;
  }
};

const handleProcessDrawing = async () => {
  if (!canvas.value || !hasDrawing.value) return;

  analyzingDrawing.value = true;
  analysisError.value = null;

  try {
    canvas.value.toBlob(async (blob) => {
      if (blob) {
        try {
          const analysis = await aiStore.processDrawing(
            blob,
            drawingContext.value?.prompt || '',
          );
          drawingAnalysis.value = analysis;
        } catch (error) {
          console.error('Failed to analyze drawing:', error);
          analysisError.value = 'Failed to analyze drawing. Please try again.';
        } finally {
          analyzingDrawing.value = false;
        }
      }
    });
  } catch (error) {
    console.error('Failed to process drawing:', error);
    analysisError.value = 'Failed to process drawing. Please try again.';
    analyzingDrawing.value = false;
  }
};

const retryAnalysis = () => {
  analysisError.value = null;
  handleProcessDrawing();
};

const closeAnalysis = () => {
  drawingAnalysis.value = null;
  analysisError.value = null;
};

onMounted(async () => {
  initializeCanvas();
  await loadDrawingContext();
  window.addEventListener('resize', initializeCanvas);
});

onUnmounted(() => {
  window.removeEventListener('resize', initializeCanvas);
});
</script>

<template>
  <div class="flex-1 flex flex-row gap-4">
    <!-- Drawing Canvas Area -->
    <div
      class="flex-1 flex flex-row gap-4 p-6 rounded-[50px] border-4 transition-all duration-300"
      :class="
        isDrawing
          ? 'border-blue-300 bg-blue-100/30'
          : 'border-black/10 bg-orange-200/20'
      "
    >
      <div class="flex-1 flex flex-col">
        <!-- Drawing Prompt Header -->
        <div class="flex flex-col items-center gap-3 p-4">
          <!-- Loading State -->
          <div v-if="loadingContext" class="flex items-center gap-3">
            <div
              class="w-6 h-6 border-2 border-orange-300 rounded-full animate-spin border-t-orange-600"
            ></div>
            <Text variant="title" size="lg" class="text-gray-500">
              Loading drawing prompt...
            </Text>
          </div>

          <!-- Error State -->
          <div
            v-else-if="contextError"
            class="flex flex-col items-center gap-2"
          >
            <div class="flex items-center gap-2 text-red-600">
              <AlertTriangle class="w-5 h-5" />
              <Text variant="title" size="md" class="text-red-600">
                {{ contextError }}
              </Text>
            </div>
            <UiButton
              :has-icon="true"
              size="sm"
              @click="loadDrawingContext"
              class="text-sm"
            >
              <template #icon>
                <RefreshCw class="w-4 h-4" />
              </template>
              <Text variant="subtitle" size="sm">Retry</Text>
            </UiButton>
          </div>

          <!-- Success State -->
          <Text v-else variant="title" size="lg">
            {{ drawingContext?.prompt || 'Express yourself through drawing' }}
          </Text>
        </div>

        <!-- Canvas -->
        <div
          class="flex-1 relative bg-white rounded-2xl shadow-inner overflow-hidden min-h-[400px]"
        >
          <canvas
            ref="canvas"
            class="w-full h-full cursor-crosshair"
            :class="{ 'cursor-grab': isErasing }"
            @mousedown="startDrawing"
            @mousemove="draw"
            @mouseup="stopDrawing"
            @mouseleave="stopDrawing"
            @touchstart.prevent="startDrawing"
            @touchmove.prevent="draw"
            @touchend.prevent="stopDrawing"
          />

          <!-- Status indicator -->
          <div
            class="absolute top-4 left-4 px-3 py-1 bg-black/10 rounded-full backdrop-blur-sm"
          >
            <Text variant="body" size="sm" class="text-gray-700">
              {{ isErasing ? 'Erasing' : `Drawing with ${currentColor}` }}
            </Text>
          </div>
        </div>

        <!-- Drawing Controls -->
        <div class="flex flex-col gap-4">
          <!-- Color Palette -->
          <div class="flex flex-wrap items-center justify-center gap-2">
            <div
              v-for="color in colorPalette"
              :key="color"
              class="w-8 h-8 rounded-full cursor-pointer border-2 transition-all duration-200 hover:scale-110"
              :class="
                currentColor === color && !isErasing
                  ? 'border-gray-800 scale-110'
                  : 'border-gray-300'
              "
              :style="{ backgroundColor: color }"
              @click="selectColor(color)"
            />

            <!-- Eraser -->
            <UiButton
              :has-icon="true"
              icon-location="after"
              class="rounded-full h-8 w-8 ml-2"
              @click="toggleEraser"
            >
              <template #icon>
                <Eraser v-if="!isErasing" :size="12" />
                <Pencil v-else :size="12" />
              </template>
            </UiButton>
          </div>

          <!-- Pen Width Control -->
          <div class="flex items-center justify-center gap-3">
            <UiButton
              :has-icon="true"
              icon-location="after"
              size="sm"
              class="rounded-full"
              @click="adjustWidth(-1)"
              :disabled="currentWidth === penWidths[0]"
            >
              <template #icon>
                <Minus :size="12" />
              </template>
            </UiButton>

            <div class="flex items-center gap-2">
              <div
                class="rounded-full bg-gray-800 transition-all duration-200"
                :style="{
                  width: `${Math.max(currentWidth * 2, 8)}px`,
                  height: `${Math.max(currentWidth * 2, 8)}px`,
                }"
              />
              <Text variant="body" size="sm" class="w-8 text-center"
                >{{ currentWidth }}px</Text
              >
            </div>

            <UiButton
              :has-icon="true"
              icon-location="after"
              size="sm"
              class="rounded-full"
              @click="adjustWidth(1)"
              :disabled="currentWidth === penWidths[penWidths.length - 1]"
            >
              <template #icon>
                <Plus :size="12" />
              </template>
            </UiButton>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center justify-center gap-4">
            <UiButton
              :has-icon="true"
              @click="clearCanvas"
              :disabled="!hasDrawing"
            >
              <template #icon>
                <RotateCcw class="w-4 h-4" />
              </template>
              <Text variant="subtitle" size="button">Clear</Text>
            </UiButton>

            <UiButton
              :has-icon="true"
              :is-primary="true"
              @click="handleProcessDrawing"
              :disabled="!hasDrawing || analyzingDrawing"
            >
              <template #icon>
                <div
                  v-if="analyzingDrawing"
                  class="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent"
                ></div>
                <Sparkles v-else class="w-4 h-4" />
              </template>
              <Text variant="subtitle" size="button">
                {{ analyzingDrawing ? 'Analyzing...' : 'Analyze Drawing' }}
              </Text>
            </UiButton>

            <UiButton :has-icon="false" @click="discardDrawing">
              <Text variant="subtitle" size="button">Discard</Text>
            </UiButton>
          </div>

          <!-- Analysis Error -->
          <div
            v-if="analysisError"
            class="flex items-center justify-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200"
          >
            <AlertTriangle class="w-4 h-4 text-red-600" />
            <Text variant="body" size="sm" class="text-red-700">{{
              analysisError
            }}</Text>
            <UiButton
              :has-icon="true"
              size="sm"
              @click="retryAnalysis"
              class="ml-2"
            >
              <template #icon>
                <RefreshCw class="w-3 h-3" />
              </template>
            </UiButton>
          </div>
        </div>
      </div>
      <div class="flex-[0.5] h-fit">
        <!-- Image Analysis Panel -->
        <ImageAnalysisPanel
          :analysis="drawingAnalysis"
          :is-loading="analyzingDrawing"
          :on-close="closeAnalysis"
        />
      </div>
    </div>

    <!-- Reflection Panel -->
    <ReflectionPanel
      :entry-content="
        drawingAnalysis
          ? 'Drawing analyzed - see insights above'
          : 'Complete your drawing and analyze it for insights'
      "
      :entry-type="EntryKind.DRAW"
    />
  </div>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

canvas {
  touch-action: none;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
