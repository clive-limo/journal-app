<script setup lang="ts">
import JournalCards from '@/components/Landing/JournalCards.vue';
import Text from '@/components/Typography/Text.vue';
import UiButton from '@/components/Ui/UiButton.vue';
import router from '@/router';
import { cardDetails } from '@/utils/data';
import { MoveRight, UserRound } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref } from 'vue';
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

onMounted(() => {
  console.log('User:', user.value);
  console.log('Default Journal:', defaultJournal.value);
});

const goToHome = () => {
  router.push({ name: 'Home' });
};
</script>

<template>
  <div
    class="h-screen grid grid-cols-1 pt-[100px] w-full bg-white overflow-auto"
  >
    <!-- header -->
    <Header :handleLogin="handleLogin" />
    <!-- Hero section -->
    <!-- <div
      class="w-full overflow-x-hidden flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8"
    >
      <div
        class="flex flex-col z-10 px-5 items-center justify-center text-center gap-5"
      >
        <h2
          class="text-6xl font-playfair tracking-tight font-extrabold text-gray-900 sm:text-6xl md:text-6xl lg:text-7xl"
        >
          <span
            >Reflect, understand, <br />
            and grow every day</span
          >
        </h2>

        <h2
          class="text-[72px] font-playfair tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl mb-6"
        >
          <span
            >Reflect, Understand, <br />
            and Grow <span class="text-orange-500"> Every Day</span></span
          >
        </h2>

        <Text variant="body" size="md" class="mt-3 mx-auto w-[470px]">
          <span class="">
            Talk, type, or just jot down your day. Our AI listens, reflects, and
            helps you see patterns in your emotions—without the pressure of
            perfect words.</span
          >
        </Text>

        <div class="w-full flex flex-row items-center justify-center">
          <UiButton :has-icon="true" icon-location="after" @click="handleLogin">
            <template #icon>
              <MoveRight />
            </template>
            <Text variant="subtitle" size="button">Get Started</Text>
          </UiButton>
        </div>
        <div class="flex flex-row items-center justify-center py-5 gap-10">
          <div v-for="card in cardDetails">
            <journal-cards
              :days-count="card.dayCount"
              :image-src="card.imageSrc"
              :title="card.title"
              :color="card.color"
            />
          </div>
        </div>
        <JournalCarousel />
      </div>
    </div> -->

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
  </div>
</template>

<style scoped></style>
