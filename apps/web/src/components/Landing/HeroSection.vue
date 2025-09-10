<template>
  <!-- Hero section -->
  <div
    class="min-h-screen flex flex-col items-center justify-center py-4 px-4 sm:py-6 sm:px-6 lg:px-8"
  >
    <div
      class="flex flex-col items-center justify-center text-center gap-6 max-w-7xl mx-auto"
    >
      <!-- Title -->
      <h2
        class="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-playfair tracking-tight font-extrabold text-gray-900"
      >
        Reflect, understand,<br class="hidden sm:block" />
        and grow every day
      </h2>

      <!-- Description -->
      <Text
        variant="body"
        size="md"
        class="mt-3 mx-auto max-w-[90%] sm:max-w-[470px] text-sm sm:text-base md:text-lg leading-relaxed text-gray-700"
      >
        Talk, type, or just jot down your day. Our AI listens, reflects, and
        helps you see patterns in your emotions—without the pressure of perfect
        words.
      </Text>

      <!-- CTA Button -->
      <div class="w-full flex flex-row items-center justify-center mt-4">
        <UiButton
          :has-icon="true"
          icon-location="after"
          @click="handleLogin"
          class="text-sm sm:text-base px-6 py-3 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-colors"
        >
          <template #icon>
            <ArrowRight class="w-4 h-4 sm:w-5 sm:h-5" />
          </template>
          <Text variant="subtitle" size="button">Get Started</Text>
        </UiButton>
      </div>

      <!-- Journal Cards - Desktop View (lg+) -->
      <div
        class="hidden lg:flex flex-row items-center justify-center py-6 gap-4 xl:gap-8"
      >
        <div v-for="card in cardDetails" :key="card.title">
          <JournalCards
            :days-count="card.dayCount"
            :image-src="card.imageSrc"
            :title="card.title"
            :color="card.color"
          />
        </div>
      </div>

      <!-- Journal Cards - Mobile/Tablet Carousel (< lg) -->
      <div class="lg:hidden w-full py-6">
        <!-- Carousel Container -->
        <div class="relative overflow-hidden">
          <div
            class="flex transition-transform duration-500 ease-in-out"
            :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
          >
            <div
              v-for="(card, index) in cardDetails"
              :key="card.title"
              class="w-full flex-shrink-0 flex justify-center px-4"
            >
              <!-- Responsive Card Wrapper -->
              <div class="w-[80%] sm:w-[70%] md:w-[60%] max-w-[300px]">
                <JournalCards
                  :days-count="card.dayCount"
                  :image-src="card.imageSrc"
                  :title="card.title"
                  :color="card.color"
                />
              </div>
            </div>
          </div>

          <!-- Navigation Arrows -->
          <button
            v-show="currentSlide > 0"
            @click="previousSlide"
            class="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full p-3 shadow-lg transition-all duration-200 z-10"
            aria-label="Previous card"
          >
            <ArrowLeft class="w-5 h-5 text-gray-700" />
          </button>
          <button
            v-show="currentSlide < cardDetails.length - 1"
            @click="nextSlide"
            class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full p-3 shadow-lg transition-all duration-200 z-10"
            aria-label="Next card"
          >
            <ArrowRight class="w-5 h-5 text-gray-700" />
          </button>
        </div>

        <!-- Carousel Dots -->
        <div class="flex justify-center mt-4 space-x-3">
          <button
            v-for="(card, index) in cardDetails"
            :key="`dot-${index}`"
            @click="goToSlide(index)"
            class="w-2.5 h-2.5 rounded-full transition-all duration-300"
            :class="
              currentSlide === index
                ? 'bg-gray-800 w-8'
                : 'bg-gray-300 hover:bg-gray-400'
            "
            :aria-label="`Go to slide ${index + 1}`"
          ></button>
        </div>

        <!-- Touch/Swipe Area -->
        <div
          class="absolute inset-0"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
          style="pointer-events: auto; z-index: 1"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { cardDetails } from '@/utils/data';
import { ref, onMounted, onUnmounted } from 'vue';
import UiButton from '../Ui/UiButton.vue';
import JournalCards from './JournalCards.vue';
import { ArrowLeft, ArrowRight } from 'lucide-vue-next';

const props = defineProps<{
  handleLogin: () => void;
}>();

// Carousel state
const currentSlide = ref(0);
const touchStartX = ref(0);
const touchEndX = ref(0);

// Carousel navigation
const nextSlide = () => {
  if (currentSlide.value < cardDetails.length - 1) {
    currentSlide.value++;
  }
};

const previousSlide = () => {
  if (currentSlide.value > 0) {
    currentSlide.value--;
  }
};

const goToSlide = (index: number) => {
  currentSlide.value = index;
};

// Touch/Swipe handlers
const handleTouchStart = (e: TouchEvent) => {
  touchStartX.value = e.changedTouches[0].screenX;
};

const handleTouchMove = (e: TouchEvent) => {
  touchEndX.value = e.changedTouches[0].screenX;
};

const handleTouchEnd = () => {
  const swipeDistance = touchStartX.value - touchEndX.value;
  if (swipeDistance > 50) {
    nextSlide();
  } else if (swipeDistance < -50) {
    previousSlide();
  }
};

// Auto-advance carousel
let autoSlideInterval: number | null = null;

const startAutoSlide = () => {
  autoSlideInterval = window.setInterval(() => {
    if (currentSlide.value < cardDetails.length - 1) {
      nextSlide();
    } else {
      currentSlide.value = 0;
    }
  }, 4000);
};

const stopAutoSlide = () => {
  if (autoSlideInterval) {
    window.clearInterval(autoSlideInterval);
    autoSlideInterval = null;
  }
};

// Keyboard navigation
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowLeft') {
    previousSlide();
  } else if (e.key === 'ArrowRight') {
    nextSlide();
  }
};

onMounted(() => {
  startAutoSlide();
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  stopAutoSlide();
  window.removeEventListener('keydown', handleKeyDown);
});
</script>
