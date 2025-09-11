<script setup lang="ts">
import JournalCards from '@/components/Landing/JournalCards.vue';
import Text from '@/components/Typography/Text.vue';
import UiButton from '@/components/Ui/UiButton.vue';
import router from '@/router';
import { cardDetails } from '@/utils/data';
import { MoveRight, UserRound, ChevronUp } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import FooterSection from '@/components/Landing/FooterSection.vue';
import HowItworks from '@/components/Landing/HowItworks.vue';
import Features from '@/components/Landing/Features.vue';
import Pricing from '@/components/Landing/Pricing.vue';
import Header from '@/components/Landing/Header.vue';
import JournalCarousel from '@/components/Landing/JournalCarousel.vue';

const auth = useAuthStore();
const { user, defaultJournal, isLoading } = storeToRefs(auth);

const loading = ref(false);
const handleLogin = async () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 3000);
  await auth.loginWithGoogle();
};

const showBackToTopButton = ref(false);

const handleScroll = () => {
  const scrollPosition = window.scrollY;
  showBackToTopButton.value = scrollPosition > 200;
};

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
};

onMounted(() => {
  console.log('User:', user.value);
  console.log('Default Journal:', defaultJournal.value);
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <div
    ref="scrollContainer"
    class="h-screen grid grid-cols-1 pt-[100px] w-full bg-[#fffff0] overflow-auto"
  >
    <!-- header -->
    <Header :handleLogin="handleLogin" />
    <!-- Hero section -->
    <div
      class="w-full h-full flex-1 flex flex-col items-center justify-center py-4 px-4 sm:py-6 sm:px-6 lg:px-8"
    >
      <div class="max-w-6xl flex flex-col gap-4 mx-auto">
        <!-- header section -->
        <div
          class="flex flex-col items-center justify-center text-center gap-4 mb-16"
        >
          <h2
            class="text-[72px] font-playfair tracking-tight font-extrabold text-gray-900 sm:text-6xl md:text-[72px] pt-16 mb-6"
          >
            <span
              >Reflect, Understand, <br />
              and Grow <span class="text-orange-500"> Every Day</span></span
            >
          </h2>
          <Text variant="body" size="md" class="mx-auto max-w-2xl">
            Talk, type, or just jot down your day. Our AI listens, reflects, and
            helps you see patterns in your emotions—without the pressure of
            perfect words.
          </Text>
        </div>

        <div class="w-full flex flex-row items-center justify-center">
          <UiButton :has-icon="true" icon-location="after" @click="handleLogin">
            <template #icon>
              <MoveRight />
            </template>
            <Text variant="subtitle" size="button">Get Started</Text>
          </UiButton>
        </div>

        <JournalCarousel />
      </div>
    </div>
    <HowItworks />
    <Features />
    <Pricing />
    <!-- footer section -->
    <FooterSection />

    <!-- back to top button -->
    <Transition name="fade">
      <button
        @click="scrollToTop"
        class="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border border-gray-200"
        aria-label="Scroll to top"
      >
        <ChevronUp class="w-5 h-5 text-orange-500" />
      </button>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
