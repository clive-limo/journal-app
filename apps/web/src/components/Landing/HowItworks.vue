<script setup lang="ts">
import Text from '@/components/Typography/Text.vue';
import UiButton from '@/components/Ui/UiButton.vue';
import FooterSection from '@/components/Landing/FooterSection.vue';
import router from '@/router';
import { useAuthStore } from '@/stores/auth';
import {
  MoveRight,
  UserRound,
  MessageCircle,
  Brain,
  TrendingUp,
  Calendar,
} from 'lucide-vue-next';
import { howItWorksSteps } from '@/utils/data';

const auth = useAuthStore();

const handleLogin = async () => {
  await auth.loginWithGoogle();
};
</script>

<template>
  <!-- body -->
  <div
    class="h-full flex-1 flex flex-col items-center justify-center py-4 px-4 sm:py-6 sm:px-6 lg:px-8"
  >
    <div class="max-w-6xl flex flex-col gap-4 mx-auto">
      <!-- header section -->
      <div
        class="flex flex-col items-center justify-center text-center gap-4 mb-16"
      >
        <h2
          class="text-[72px] font-playfair tracking-tight font-extrabold text-black sm:text-5xl md:text-6xl mb-6"
        >
          How Echo Journal Works
        </h2>
        <Text variant="body" size="md" class="mx-auto max-w-2xl">
          Transform your daily reflections into meaningful insights with our
          simple, AI-powered process
        </Text>
      </div>

      <!-- steps section -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-10">
        <div
          v-for="step in howItWorksSteps"
          :key="step.id"
          class="flex flex-col items-center text-center p-6 rounded-[50px] border-4 border-orange-500/20 bg-gray-500/5 backdrop-blur-sm hover:shadow-lg transition-shadow duration-300"
        >
          <div
            class="mb-2 w-12 h-12 flex items-center justify-center rounded-full bg-orange-500/20 text-sm font-bold text-gray-700"
          >
            <Text variant="title" size="md">{{ step.id }}</Text>
          </div>
          <Text variant="fira-bold" size="md" class="text-orange-500 mb-3">
            {{ step.title }}
          </Text>
          <Text variant="body" size="sm" class="text-gray-600">
            {{ step.description }}
          </Text>
        </div>
      </div>

      <!-- demo section -->
      <div class="bg-orange-500/10 rounded-[70px] backdrop-blur-lg p-8 mb-12">
        <div class="text-center flex flex-col gap-1 pb-8">
          <Text variant="subtitle" size="lg" class="font-bold mb-2">
            See It In Action
          </Text>
          <Text variant="body" size="md" class="text-gray-600">
            Watch how a simple journal entry becomes meaningful insight
          </Text>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div class="bg-orange-500 rounded-[50px] p-6 shadow-sm">
            <Text variant="subtitle" size="sm" class="text-gray-500 mb-2"
              >Your Entry</Text
            >
            <Text variant="body" size="md" class="italic">
              "Had a tough day at work today. Felt overwhelmed with the new
              project deadline. But managed to take a walk during lunch which
              helped clear my head..."
            </Text>
          </div>

          <div class="bg-white rounded-[50px] p-6 shadow-sm">
            <Text variant="subtitle" size="sm" class="text-gray-500 mb-2"
              >AI Insights</Text
            >
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-red-400 rounded-full"></div>
                <Text variant="body" size="sm">Stress level: Moderate</Text>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                <Text variant="body" size="sm"
                  >Coping strategy: Physical activity</Text
                >
              </div>
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-blue-400 rounded-full"></div>
                <Text variant="body" size="sm">Theme: Work-life balance</Text>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
