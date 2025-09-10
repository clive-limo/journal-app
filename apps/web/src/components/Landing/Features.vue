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
  Mic,
  Brain,
  TrendingUp,
  Shield,
  Smartphone,
  Calendar,
  BarChart3,
  Heart,
  Target,
} from 'lucide-vue-next';

const auth = useAuthStore();

const handleLogin = async () => {
  await auth.loginWithGoogle();
};

const mainFeatures = [
  {
    icon: MessageCircle,
    title: 'Multiple Input Methods',
    description:
      'Write, type, or record voice notes. Express yourself however feels most natural.',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Brain,
    title: 'AI-Powered Insights',
    description:
      'Our advanced AI analyzes your entries to identify patterns, emotions, and growth opportunities.',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    description:
      'Visualize your emotional journey with beautiful charts and meaningful progress indicators.',
    color: 'text-green-500',
    bgColor: 'bg-green-50',
  },
];

const additionalFeatures = [
  {
    icon: Shield,
    title: 'Privacy First',
    description:
      'Your thoughts are encrypted and secure. We never share your personal data.',
  },
  {
    icon: Smartphone,
    title: 'Cross-Platform',
    description:
      'Access your journal from any device, anywhere, with seamless synchronization.',
  },
  {
    icon: Calendar,
    title: 'Smart Reminders',
    description:
      'Gentle, personalized reminders to help you maintain your journaling habit.',
  },
  {
    icon: BarChart3,
    title: 'Mood Analytics',
    description:
      'Understand your emotional patterns with detailed mood tracking and analysis.',
  },
  {
    icon: Heart,
    title: 'Wellness Focus',
    description:
      'Built with mental health best practices to support your wellbeing journey.',
  },
  {
    icon: Target,
    title: 'Goal Setting',
    description:
      'Set and track personal growth goals with AI-powered guidance and motivation.',
  },
];
</script>

<template>
  <!-- body -->
  <div class="flex-1 py-12 px-4 sm:px-6 lg:px-8">
    <div class="flex flex-col items-center justify-center gap-4 mx-auto">
      <!-- header section -->
      <div class="text-center flex flex-col items-center justify-center mb-16">
        <h2
          class="text-[72px] font-playfair tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl mb-6"
        >
          Powerful Features for
          <span class="text-orange-500">Personal Growth</span>
        </h2>
        <Text variant="body" size="md" class="mx-auto max-w-2xl">
          Everything you need to transform your daily reflections into
          meaningful insights and lasting positive change
        </Text>
      </div>

      <!-- main features -->
      <div
        class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 py-12"
      >
        <div
          v-for="feature in mainFeatures"
          :key="feature.title"
          class="text-center p-8 rounded-[50px] bg-[#F1ACB490] hover:shadow-xl transition-all duration-300"
        >
          <div :class="`inline-flex p-4 rounded-2xl ${feature.bgColor} mb-6`">
            <component
              :is="feature.icon"
              :class="`w-10 h-10 ${feature.color}`"
            />
          </div>
          <Text variant="subtitle" size="lg" class="font-bold mb-4">
            {{ feature.title }}
          </Text>
          <Text variant="body" size="md" class="text-gray-600">
            {{ feature.description }}
          </Text>
        </div>
      </div>

      <!-- detailed features grid -->
      <div class="pb-16 max-w-7xl mx-auto">
        <div class="text-center flex flex-col items-center pb-12">
          <Text
            variant="title"
            size="button"
            class="font-black text-orange-500 mb-4"
          >
            Everything You Need
          </Text>
          <Text
            variant="body"
            size="sm"
            class="text-gray-600 max-w-2xl mx-auto"
          >
            Discover all the features that make Echo Journal the perfect
            companion for your personal growth journey
          </Text>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="feature in additionalFeatures"
            :key="feature.title"
            class="p-6 rounded-[30px] border-2 bg-orange-500/10 border-orange-500/10 hover:border-orange-200 hover:shadow-md transition-all duration-300"
          >
            <div class="flex flex-row gap-2 items-start space-x-4">
              <div class="flex-shrink-0 p-2 bg-orange-500/10 rounded-lg">
                <component :is="feature.icon" class="w-6 h-6 text-orange-500" />
              </div>
              <div class="flex-1">
                <Text
                  variant="fira-bold"
                  size="md"
                  class="font-bold text-black mb-2"
                >
                  {{ feature.title }}
                </Text>
                <Text variant="body" size="sm" class="text-gray-600">
                  {{ feature.description }}
                </Text>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- feature highlight section -->
      <div
        class="bg-gradient-to-br from-[#F1ACB450] to-yellow-50 backdrop-blur-sm rounded-[50px] p-12 mt-12 mb-16"
      >
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <Text
              variant="subtitle"
              size="xl"
              class="font-bold text-orange-500 mb-4"
            >
              Experience the Power of AI Understanding
            </Text>
            <Text variant="body" size="md" class="text-gray-700 mb-6">
              Our AI doesn't just store your entries—it understands them. Get
              personalized insights, track emotional patterns, and receive
              thoughtful reflections that help you grow.
            </Text>
            <div class="space-y-4">
              <div class="flex flex-row gap-3 items-center space-x-3">
                <div class="w-2 h-2 bg-orange-500 rounded-full"></div>
                <Text variant="body" size="sm"
                  >Emotion pattern recognition</Text
                >
              </div>
              <div class="flex flex-row gap-3 items-center space-x-3">
                <div class="w-2 h-2 bg-orange-500 rounded-full"></div>
                <Text variant="body" size="sm"
                  >Personalized growth suggestions</Text
                >
              </div>
              <div class="flex flex-row gap-3 items-center space-x-3">
                <div class="w-2 h-2 bg-orange-500 rounded-full"></div>
                <Text variant="body" size="sm"
                  >Meaningful reflection prompts</Text
                >
              </div>
            </div>
          </div>
          <div class="bg-white rounded-2xl p-6 shadow-lg">
            <Text variant="subtitle" size="sm" class="text-gray-500 mb-3"
              >Sample AI Insight</Text
            >
            <div class="space-y-3">
              <div class="bg-blue-50 rounded-lg p-3">
                <Text variant="body" size="sm" class="text-blue-800">
                  "I notice you've mentioned feeling energized after morning
                  walks 3 times this week. This could be a powerful habit to
                  build on."
                </Text>
              </div>
              <Text variant="body" size="sm" class="text-gray-500">
                Based on your entries from March 1-7
              </Text>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA section -->
      <!-- <div class="text-center bg-gray-50 rounded-2xl p-12">
        <Text variant="subtitle" size="xl" class="font-bold mb-4">
          Ready to unlock your potential?
        </Text>
        <Text
          variant="body"
          size="md"
          class="text-gray-600 mb-8 max-w-xl mx-auto"
        >
          Join thousands of users who are already discovering deeper insights
          about themselves
        </Text>
        <UiButton
          :has-icon="true"
          icon-location="after"
          @click="handleLogin"
          class="mb-4"
        >
          <template #icon>
            <MoveRight />
          </template>
          <Text variant="subtitle" size="button">Start Your Journey</Text>
        </UiButton>
        <div class="mt-4">
          <Text variant="body" size="sm" class="text-gray-500">
            Free trial • No setup required • Cancel anytime
          </Text>
        </div>
      </div> -->
    </div>
  </div>
</template>
