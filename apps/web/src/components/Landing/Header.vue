<template>
  <div class="absolute top-0 w-full z-20 bg-gray-500/5 backdrop-blur-lg">
    <!-- Mobile Navigation -->
    <div class="flex md:hidden flex-row justify-between items-center px-4 py-2">
      <img
        src="@/assets/images/echo_journal_logo.png"
        class="h-[60px] w-[115px]"
        alt="Echo Journal Logo"
      />

      <!-- Mobile Menu Button -->
      <!-- <button
        @click="toggleMobileMenu"
        class="p-2 rounded-md hover:bg-gray-100/10 transition-colors"
        aria-label="Toggle menu"
      >
        <svg
          class="w-6 h-6 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          ></path>
        </svg>
      </button> -->

      <UiButton
        :has-icon="true"
        icon-location="after"
        @click="toggleMobileMenu"
        class="md:text-sm lg:text-base"
      >
        <template #icon>
          <Hamburger class="w-4 h-4 lg:w-5 lg:h-5" />
        </template>
      </UiButton>
    </div>

    <!-- Mobile Menu Dropdown -->
    <div
      v-show="isMobileMenuOpen"
      class="md:hidden bg-white/95 backdrop-blur-lg border-t border-gray-200/20 px-4 py-4 space-y-4"
    >
      <button
        @click="
          router.push({ name: 'Features' });
          toggleMobileMenu();
        "
        class="block w-full text-left py-2 text-playfair"
      >
        <Text variant="subtitle" size="button" class="text-orange-500"
          >How It Works</Text
        >
      </button>
      <button
        @click="
          router.push({ name: 'Features' });
          toggleMobileMenu();
        "
        class="block w-full text-left py-2"
      >
        <Text variant="subtitle" size="button">Features</Text>
      </button>
      <button
        @click="
          router.push({ name: 'Pricing' });
          toggleMobileMenu();
        "
        class="block w-full text-left py-2"
      >
        <Text variant="subtitle" size="button">Pricing</Text>
      </button>
      <div class="pt-2 border-t border-gray-200/20">
        <UiButton
          :has-icon="true"
          icon-location="after"
          @click="handleLogin"
          class="w-full justify-center"
        >
          <template #icon>
            <UserRound />
          </template>
          <Text variant="subtitle" size="button">Login</Text>
        </UiButton>
      </div>
    </div>

    <!-- Desktop Navigation -->
    <div
      class="hidden md:flex flex-row justify-between items-center px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-40 py-2"
    >
      <img
        src="@/assets/images/echo_journal_logo.png"
        class="h-[60px] w-[115px] lg:h-[75px] lg:w-[144px] xl:h-[89px] xl:w-[171px]"
        alt="Echo Journal Logo"
      />

      <div class="flex flex-row items-center gap-2 lg:gap-4">
        <!-- Navigation Links -->
        <div class="hidden lg:flex flex-row gap-2 xl:gap-4 xl:pr-16 lg:pr-8">
          <button
            @click="scrollToSection('how-it-works')"
            class="text-playfair px-2 py-1 rounded hover:bg-gray-100/10 transition-colors"
          >
            <Text variant="subtitle" size="button" class="text-orange-500"
              >How It Works</Text
            >
          </button>
          <button
            @click="scrollToSection('features')"
            class="px-2 py-1 rounded hover:bg-gray-100/10 transition-colors"
          >
            <Text variant="subtitle" size="button">Features</Text>
          </button>
          <button
            @click="scrollToSection('pricing')"
            class="px-2 py-1 rounded hover:bg-gray-100/10 transition-colors"
          >
            <Text variant="subtitle" size="button">Pricing</Text>
          </button>
        </div>

        <!-- Tablet Navigation (condensed) -->
        <div class="flex lg:hidden md:flex flex-row gap-1 pr-4">
          <button
            @click="scrollToSection('how-it-works')"
            class="text-playfair px-1.5 py-1 rounded hover:bg-gray-100/10 transition-colors text-sm"
          >
            <Text variant="subtitle" size="sm" class="text-orange-500"
              >Works</Text
            >
          </button>
          <button
            @click="scrollToSection('features')"
            class="px-1.5 py-1 rounded hover:bg-gray-100/10 transition-colors text-sm"
          >
            <Text variant="subtitle" size="sm">Features</Text>
          </button>
          <button
            @click="scrollToSection('pricing')"
            class="px-1.5 py-1 rounded hover:bg-gray-100/10 transition-colors text-sm"
          >
            <Text variant="subtitle" size="sm">Pricing</Text>
          </button>
        </div>

        <!-- Login Button -->
        <UiButton
          :has-icon="true"
          icon-location="after"
          @click="handleLogin"
          class="md:text-sm lg:text-base"
        >
          <template #icon>
            <UserRound class="w-4 h-4 lg:w-5 lg:h-5" />
          </template>
          <Text variant="subtitle" size="sm" class="hidden sm:inline lg:inline"
            >Login</Text
          >
          <Text variant="subtitle" size="sm" class="sm:hidden lg:hidden"
            >Login</Text
          >
        </UiButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import router from '@/router';
import { ref } from 'vue';
import UiButton from '../Ui/UiButton.vue';
import Text from '../Typography/Text.vue';
import { Hamburger, UserRound } from 'lucide-vue-next';

const isMobileMenuOpen = ref(false);

const props = defineProps<{
  handleLogin: () => void;
}>();

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const scrollToSection = (section: string) => {
  const element = document.getElementById(section);
  if (element) {
    // Temporarily set scroll margin
    element.style.scrollMarginTop = '80px';
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Clean up after scroll completes
    setTimeout(() => {
      element.style.scrollMarginTop = '';
    }, 1000);
  }
};
</script>
