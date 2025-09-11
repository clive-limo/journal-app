<template>
  <div class="w-full flex-col relative overflow-hidden py-5">
    <!-- Carousel Container -->
    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 transition-transform flex-row items-center gap-2 duration-500 ease-in-out"
    >
      <div
        v-for="card in cardDetails"
        :key="card.title"
        class="flex flex-row items-center justify-center"
      >
        <JournalCards
          :days-count="card.dayCount"
          :image-src="card.imageSrc"
          :title="card.title"
          :color="card.color"
        />
      </div>
    </div>

    <!-- Navigation Arrows -->
    <!-- <button
      v-if="showPrev"
      @click="prev"
      class="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full p-3 shadow-lg transition-all duration-200 z-10"
      aria-label="Previous"
    >
      <ArrowLeft class="w-5 h-5 text-gray-700" />
    </button>
    <button
      v-if="showNext"
      @click="next"
      class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full p-3 shadow-lg transition-all duration-200 z-10"
      aria-label="Next"
    >
      <ArrowRight class="w-5 h-5 text-gray-700" />
    </button> -->

    <!-- Carousel Dots -->
    <div class="flex justify-center pt-4 gap-x-3">
      <button
        v-for="i in numDots"
        :key="i"
        @click="goTo(i - 1)"
        class="w-2.5 h-2.5 rounded-full transition-all duration-300"
        :class="
          currentIndex === i - 1
            ? 'bg-gray-800 w-8'
            : 'bg-gray-300 hover:bg-gray-400'
        "
        :aria-label="`Go to slide ${i}`"
      ></button>
    </div>

    <!-- Touch/Swipe Area -->
    <!-- <div
      class="absolute inset-0"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      style="pointer-events: auto; z-index: 1"
    ></div> -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ArrowLeft, ArrowRight } from 'lucide-vue-next';
import { cardDetails } from '@/utils/data';
import JournalCards from './JournalCards.vue';

const currentIndex = ref(0);
const visibleSlides = ref(1);
const touchStartX = ref(0);
const touchEndX = ref(0);

const updateVisibleSlides = () => {
  const width = window.innerWidth;
  if (width >= 1024) {
    // lg: large screens, 4 cards
    visibleSlides.value = 4;
  } else if (width >= 768) {
    // md: medium screens, 2 cards
    visibleSlides.value = 2;
  } else {
    // small screens, 1 card
    visibleSlides.value = 1;
  }
};

onMounted(() => {
  updateVisibleSlides();
  window.addEventListener('resize', updateVisibleSlides);
  window.addEventListener('keydown', handleKeyDown);
  startAutoSlide();
});

onUnmounted(() => {
  window.removeEventListener('resize', updateVisibleSlides);
  window.removeEventListener('keydown', handleKeyDown);
  stopAutoSlide();
});

const itemStyle = computed(() => ({
  width: `${120 / visibleSlides.value}%`,
}));

const slidePercentage = computed(() => 100 / visibleSlides.value);

const showPrev = computed(() => currentIndex.value > 0);
const showNext = computed(
  () => currentIndex.value < cardDetails.length - visibleSlides.value,
);
const numDots = computed(() => cardDetails.length - visibleSlides.value + 1);

const next = () => {
  if (showNext.value) {
    currentIndex.value++;
  }
};

const prev = () => {
  if (showPrev.value) {
    currentIndex.value--;
  }
};

const goTo = (index: number) => {
  currentIndex.value = index;
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
    next();
  } else if (swipeDistance < -50) {
    prev();
  }
};

// Keyboard navigation
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowLeft') {
    prev();
  } else if (e.key === 'ArrowRight') {
    next();
  }
};

// Auto-advance carousel
let autoSlideInterval: number | null = null;

const startAutoSlide = () => {
  autoSlideInterval = window.setInterval(() => {
    if (currentIndex.value < cardDetails.length - visibleSlides.value) {
      next();
    } else {
      currentIndex.value = 0;
    }
  }, 4000);
};

const stopAutoSlide = () => {
  if (autoSlideInterval) {
    window.clearInterval(autoSlideInterval);
    autoSlideInterval = null;
  }
};
</script>
