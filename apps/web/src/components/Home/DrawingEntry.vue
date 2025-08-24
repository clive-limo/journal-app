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
} from 'lucide-vue-next';
import ReflectionPanel from './ReflectionPanel.vue';
import { EntryKind } from '@/utils/types';
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

const drawingContext = ref<{
  prompt: string;
  suggestions: string[];
  elements: Array<{ type: string; description: string }>;
} | null>(null);
const drawingDescription = ref('No drawing yet');
const drawingSummary = ref('No summary yet');
const loadingContext = ref(false);
const aiStore = useAIReflectionStore();

const handleProcessDrawing = async () => {
  if (!canvas.value || !hasDrawing.value) return;
  canvas.value.toBlob(async (blob) => {
    if (blob) {
      const description = await aiStore.processDrawing(
        blob,
        drawingContext?.value?.prompt || '',
      );
      const summary = [
        `${description.contextAlignment.score}/10 context alignment score`,
        `Emotions detected: ${description.colors.map((color: { name: string; dominance: string; emotion: string }) => color.emotion).join(', ')}`,
        `Insights: ${description.insights.join(', ')}`,
      ].join('\n');
      drawingDescription.value = description;
      drawingSummary.value = summary;
    }
  });
};

onMounted(async () => {
  initializeCanvas();
  loadingContext.value = true;
  try {
    const context = await aiStore.getDrawingContext();
    drawingContext.value = context;
  } catch (error) {
    console.log(error);
  } finally {
    loadingContext.value = false;
  }

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
      class="flex-1 flex flex-col gap-4 p-6 rounded-[50px] border-4 transition-all duration-300"
      :class="
        isDrawing
          ? 'border-blue-300 bg-blue-100/30'
          : 'border-black/10 bg-orange-200/20'
      "
    >
      <div class="flex flex-col items-center gap-3 p-4">
        <Text variant="title" size="lg">{{ drawingContext?.prompt }}</Text>
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
            :disabled="!hasDrawing"
          >
            <template #icon>
              <Save class="w-4 h-4" />
            </template>
            <Text variant="subtitle" size="button">Analyze Drawing</Text>
          </UiButton>

          <UiButton :has-icon="false" @click="discardDrawing">
            <Text variant="subtitle" size="button">Discard</Text>
          </UiButton>
        </div>
      </div>
    </div>

    <!-- Reflections panel -->
    <!-- <transition name="fade-slide">
      <div
        class="flex-[0.5] flex flex-col p-8 rounded-[50px] border-4 border-black/10 bg-orange-200/20 backdrop-blur-md"
      >
        <div
          class="flex-1 flex flex-col items-center justify-center text-center gap-4"
        >
          <Text variant="title" size="lg">Reflection</Text>
          <Text variant="body" size="sm" class="w-2/3"
            >Step back and take a closer look at your drawing — with a little
            help from AI to spot patterns and insights...</Text
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
    </transition> -->
    <ReflectionPanel
      :entry-content="drawingSummary"
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
</style>
