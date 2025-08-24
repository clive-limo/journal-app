<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import UiButton from '@/components/Ui/UiButton.vue';
import Text from '@/components/Typography/Text.vue';
import { Home, ArrowLeft, Search, HelpCircle } from 'lucide-vue-next';

// Animated elements
const isLoaded = ref(false);
const floatingElements = ref(
  Array(8)
    .fill(0)
    .map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 2,
    })),
);

// Navigation functions
const goHome = () => {
  // Replace with your router navigation
  window.location.href = '/';
};

const goBack = () => {
  window.history.back();
};

const openSearch = () => {
  // Implement search functionality
  console.log('Opening search...');
};

const openHelp = () => {
  // Implement help functionality
  console.log('Opening help...');
};

onMounted(() => {
  // Trigger entrance animation
  setTimeout(() => {
    isLoaded.value = true;
  }, 100);
});
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-orange-50 to-orange-100 relative overflow-hidden"
  >
    <!-- Floating background elements -->
    <div
      v-for="(element, index) in floatingElements"
      :key="index"
      class="absolute w-4 h-4 bg-orange-200/30 rounded-full animate-bounce"
      :style="{
        left: `${element.x}%`,
        top: `${element.y}%`,
        animationDelay: `${element.delay}s`,
        animationDuration: `${element.duration}s`,
      }"
    />

    <!-- Main 404 Container -->
    <div
      class="flex flex-col lg:flex-row items-center justify-center gap-12 max-w-6xl w-full transition-all duration-1000 ease-out"
      :class="
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      "
    >
      <!-- 404 Visual Section -->
      <div
        class="flex-1 flex flex-col items-center justify-center gap-8 p-12 rounded-[50px] border-4 border-black/10 bg-orange-200/20 backdrop-blur-md transition-all duration-700"
        :class="isLoaded ? 'scale-100' : 'scale-95'"
      >
        <!-- Large 404 Number -->
        <div class="relative">
          <Text
            variant="title"
            size="xl"
            class="text-[120px] md:text-[180px] font-black text-black/20 select-none"
          >
            404
          </Text>

          <!-- Animated question marks floating around -->
          <div
            v-for="i in 3"
            :key="i"
            class="absolute animate-bounce"
            :class="{
              'top-4 -right-8': i === 1,
              'bottom-8 -left-4': i === 2,
              'top-1/2 -right-12': i === 3,
            }"
            :style="{ animationDelay: `${i * 0.5}s` }"
          >
            <HelpCircle class="w-6 h-6 md:w-8 md:h-8 text-orange-400/60" />
          </div>
        </div>

        <!-- Pulsing circle animation -->
        <div class="relative">
          <div
            class="w-32 h-32 rounded-full border-4 border-orange-300/50 flex items-center justify-center"
          >
            <div
              class="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 animate-pulse"
            />
          </div>
          <div
            class="absolute inset-0 rounded-full border-4 border-orange-400/30 animate-ping"
          />
        </div>
      </div>

      <!-- Content Section -->
      <div
        class="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left gap-8 p-8 transition-all duration-700 delay-300"
        :class="
          isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
        "
      >
        <!-- Main Heading -->
        <div class="space-y-4">
          <Text
            variant="title"
            size="xl"
            class="text-4xl md:text-5xl font-black"
          >
            Oops! Page Not Found
          </Text>

          <Text variant="body" size="lg" class="text-black/70 max-w-md">
            Looks like you've ventured into uncharted territory. The page you're
            looking for seems to have gone on its own adventure.
          </Text>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <UiButton
            :has-icon="true"
            :is-primary="true"
            icon-location="before"
            @click="goHome"
            class="flex-1"
          >
            <template #icon>
              <Home class="w-5 h-5" />
            </template>
            <Text variant="subtitle" size="button">Go Home</Text>
          </UiButton>

          <UiButton
            :has-icon="true"
            icon-location="before"
            @click="goBack"
            class="flex-1"
          >
            <template #icon>
              <ArrowLeft class="w-5 h-5" />
            </template>
            <Text variant="subtitle" size="button">Go Back</Text>
          </UiButton>
        </div>

        <!-- Additional Actions -->
        <div class="flex flex-col sm:flex-row gap-3 pt-4">
          <UiButton
            :has-icon="true"
            icon-location="before"
            @click="openSearch"
            size="sm"
          >
            <template #icon>
              <Search class="w-4 h-4" />
            </template>
            <Text variant="body" size="sm">Search Site</Text>
          </UiButton>

          <UiButton
            :has-icon="true"
            icon-location="before"
            @click="openHelp"
            size="sm"
          >
            <template #icon>
              <HelpCircle class="w-4 h-4" />
            </template>
            <Text variant="body" size="sm">Get Help</Text>
          </UiButton>
        </div>

        <!-- Helpful suggestions -->
        <div class="pt-6 border-t border-black/10 w-full max-w-md">
          <Text variant="body" size="sm" class="text-black/50 mb-3">
            Common destinations:
          </Text>
          <div class="flex flex-wrap gap-2">
            <button
              class="px-3 py-1 text-sm bg-orange-100 hover:bg-orange-200 rounded-full transition-colors"
            >
              Dashboard
            </button>
            <button
              class="px-3 py-1 text-sm bg-orange-100 hover:bg-orange-200 rounded-full transition-colors"
            >
              Journal
            </button>
            <button
              class="px-3 py-1 text-sm bg-orange-100 hover:bg-orange-200 rounded-full transition-colors"
            >
              Settings
            </button>
            <button
              class="px-3 py-1 text-sm bg-orange-100 hover:bg-orange-200 rounded-full transition-colors"
            >
              Profile
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Decorative wave at bottom -->
    <div
      class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-orange-200/30 to-transparent pointer-events-none"
    />
  </div>
</template>

<style scoped>
/* Custom animations */
@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(180deg);
  }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

/* Responsive text sizing */
@media (max-width: 768px) {
  .text-\[120px\] {
    font-size: 80px;
  }

  .text-\[180px\] {
    font-size: 120px;
  }
}

/* Hover effects for suggestion buttons */
button:hover {
  transform: translateY(-1px);
}
</style>
