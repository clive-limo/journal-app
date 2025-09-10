<script setup lang="ts">
import Text from '@/components/Typography/Text.vue';
import UiButton from '@/components/Ui/UiButton.vue';
import FooterSection from '@/components/Landing/FooterSection.vue';
import router from '@/router';
import { useAuthStore } from '@/stores/auth';
import {
  MoveRight,
  UserRound,
  Check,
  Star,
  Zap,
  Crown,
  MoonStar,
  Brain,
  TrendingUp,
  Shield,
  Smartphone,
  Calendar,
} from 'lucide-vue-next';
import { ref } from 'vue';

const auth = useAuthStore();
const isYearly = ref(false);

const handleLogin = async () => {
  await auth.loginWithGoogle();
};

const togglePricing = () => {
  isYearly.value = !isYearly.value;
};

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for getting started with journaling',
    icon: MoonStar,
    monthlyPrice: 0,
    yearlyPrice: 0,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    buttonColor: 'bg-blue-500 hover:bg-blue-600',
    features: [
      '30 journal entries per month',
      'Basic AI insights',
      'Mobile app access',
      'Entry templates',
      'Basic mood tracking',
    ],
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For serious journalers seeking deeper insights',
    icon: Zap,
    monthlyPrice: 9,
    yearlyPrice: 79, // Save ~26%
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    buttonColor: 'bg-orange-500 hover:bg-orange-600',
    features: [
      'Unlimited journal entries',
      'Advanced AI analysis',
      'Detailed progress tracking',
      'Custom goal setting',
      'Voice-to-text journaling',
      'Export capabilities',
      'Priority support',
    ],
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Ultimate journaling experience with coaching',
    icon: Crown,
    monthlyPrice: 19,
    yearlyPrice: 179, // Save ~22%
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    buttonColor: 'bg-purple-500 hover:bg-purple-600',
    features: [
      'Everything in Pro',
      'AI coaching suggestions',
      'Advanced analytics dashboard',
      'Habit tracking integration',
      'Weekly insights reports',
      'Custom reflection prompts',
      '1-on-1 onboarding call',
    ],
    popular: false,
  },
];

const features = [
  { icon: Brain, text: 'AI-powered emotional insights' },
  { icon: TrendingUp, text: 'Progress visualization' },
  { icon: Shield, text: 'Bank-level security' },
  { icon: Smartphone, text: 'Cross-platform sync' },
  { icon: Calendar, text: 'Smart reminders' },
];
</script>

<template>
  <!-- body -->
  <div class="flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="                 ">
      <!-- header section -->
      <div class="text-center flex flex-col items-center pb-16">
        <h2
          class="text-[72px] font-playfair tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl mb-6"
        >
          Simple, Transparent
          <span class="text-orange-500">Pricing</span>
        </h2>
        <Text variant="body" size="md" class="mx-auto max-w-2xl mb-8">
          Choose the perfect plan for your journaling journey. Upgrade or
          downgrade anytime.
        </Text>

        <!-- pricing toggle -->
        <div class="flex gap-2 items-center justify-center space-x-4 pt-8">
          <Text
            variant="body"
            size="md"
            :class="!isYearly ? 'text-orange-500 font-semibold' : 'text-black'"
          >
            Monthly
          </Text>
          <button
            @click="togglePricing"
            :class="[
              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
              isYearly ? 'bg-orange-500' : 'bg-gray-200',
            ]"
          >
            <span
              :class="[
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                isYearly ? 'translate-x-5' : 'translate-x-0',
              ]"
            />
          </button>
          <div class="flex items-center space-x-2">
            <Text
              variant="body"
              size="md"
              :class="
                isYearly ? 'text-orange-500 font-semibold' : 'text-gray-500'
              "
            >
              Yearly
            </Text>
            <span
              class="bg-[#F1ACB410] text-[#F1ACB4] text-xs font-medium px-2.5 py-0.5 rounded-full"
            >
              Save up to 26%
            </span>
          </div>
        </div>
      </div>

      <!-- pricing cards -->
      <div class="max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-8 pb-16">
        <div
          v-for="plan in plans"
          :key="plan.id"
          :class="[
            'relative rounded-2xl p-8 bg-orange-500/5 backdrop-blur-md transition-all duration-300',
            plan.popular
              ? 'ring-4 ring-orange-500 shadow-xl scale-105'
              : 'border-4 border-black/10 hover:shadow-lg',
          ]"
        >
          <!-- popular badge -->
          <div
            v-if="plan.popular"
            class="absolute -top-4 left-1/2 transform -translate-x-1/2"
          >
            <div
              class="bg-orange-500 text-white px-4 py-1 rounded-full flex items-center space-x-1"
            >
              <Star class="w-4 h-4" />
              <Text variant="body" size="sm" class="font-semibold"
                >Most Popular</Text
              >
            </div>
          </div>

          <!-- plan header -->
          <div class="text-center mb-6">
            <div :class="`inline-flex p-3 rounded-xl ${plan.bgColor} mb-4`">
              <component :is="plan.icon" :class="`w-8 h-8 ${plan.color}`" />
            </div>
            <Text variant="subtitle" size="xl" class="font-bold mb-2">
              {{ plan.name }}
            </Text>
            <Text variant="body" size="sm" class="text-gray-600 mb-4">
              {{ plan.description }}
            </Text>

            <!-- pricing -->
            <div class="pb-4">
              <div class="flex items-baseline justify-center space-x-1">
                <span class="text-4xl font-bold text-gray-900">
                  ${{ isYearly ? plan.yearlyPrice : plan.monthlyPrice }}
                </span>
                <Text variant="body" size="sm" class="text-gray-500">
                  /{{ isYearly ? 'year' : 'month' }}
                </Text>
              </div>
              <div v-if="isYearly && plan.monthlyPrice > 0" class="mt-1">
                <Text variant="body" size="sm" class="text-gray-500">
                  Billed annually ({{
                    Math.round(
                      (1 - plan.yearlyPrice / (plan.monthlyPrice * 12)) * 100,
                    )
                  }}% savings)
                </Text>
              </div>
            </div>
          </div>

          <!-- features list -->
          <ul class="space-y-3 pb-8">
            <li
              v-for="feature in plan.features"
              :key="feature"
              class="flex gap-2 items-start space-x-3"
            >
              <Check class="w-5 h-5 text-[#F1ACB4] flex-shrink-0 mt-0.5" />
              <Text variant="body" size="sm">{{ feature }}</Text>
            </li>
          </ul>

          <!-- CTA button -->
          <div class="flex flex-row items-center justify-center">
            <UiButton
              :has-icon="true"
              icon-location="after"
              @click="handleLogin"
              :is-primary="plan.popular"
              class="mb-4 mx-auto"
            >
              <template #icon>
                <MoveRight />
              </template>
              <Text variant="subtitle" size="button">{{
                plan.id === 'starter' ? 'Get Started Free' : 'Start Free Trial'
              }}</Text>
            </UiButton>
          </div>
          <!-- <button
            :class="[
              'w-full py-3 px-4 rounded-xl font-semibold transition-colors duration-200',
              plan.id === 'starter'
                ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                : `text-white ${plan.buttonColor}`,
            ]"
            @click="handleLogin"
          >
            <Text variant="subtitle" size="button">
              {{
                plan.id === 'starter' ? 'Get Started Free' : 'Start Free Trial'
              }}
            </Text>
          </button> -->
        </div>
      </div>

      <!-- features highlight -->
      <div class="text-center mb-16">
        <Text variant="subtitle" size="lg" class="font-bold pb-8">
          Every plan includes
        </Text>
        <div class="flex flex-wrap justify-center items-center gap-8">
          <div
            v-for="feature in features"
            :key="feature.text"
            class="flex items-center space-x-2"
          >
            <component :is="feature.icon" class="w-5 h-5 text-orange-500" />
            <Text variant="body" size="sm">{{ feature.text }}</Text>
          </div>
        </div>
      </div>

      <!-- FAQ section -->
      <!-- <div class="mb-16">
        <div class="text-center mb-12">
          <Text variant="subtitle" size="xl" class="font-bold mb-4">
            Frequently Asked Questions
          </Text>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div class="space-y-6">
            <div>
              <Text variant="subtitle" size="md" class="font-semibold mb-2">
                Can I change plans anytime?
              </Text>
              <Text variant="body" size="sm" class="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes
                take effect immediately.
              </Text>
            </div>

            <div>
              <Text variant="subtitle" size="md" class="font-semibold mb-2">
                Is there a free trial?
              </Text>
              <Text variant="body" size="sm" class="text-gray-600">
                Yes! All paid plans come with a 14-day free trial. No credit
                card required to start.
              </Text>
            </div>

            <div>
              <Text variant="subtitle" size="md" class="font-semibold mb-2">
                How secure is my data?
              </Text>
              <Text variant="body" size="sm" class="text-gray-600">
                Your entries are encrypted with bank-level security. We never
                share your personal data with third parties.
              </Text>
            </div>
          </div>

          <div class="space-y-6">
            <div>
              <Text variant="subtitle" size="md" class="font-semibold mb-2">
                What payment methods do you accept?
              </Text>
              <Text variant="body" size="sm" class="text-gray-600">
                We accept all major credit cards, PayPal, and Apple Pay for your
                convenience.
              </Text>
            </div>

            <div>
              <Text variant="subtitle" size="md" class="font-semibold mb-2">
                Can I cancel anytime?
              </Text>
              <Text variant="body" size="sm" class="text-gray-600">
                Absolutely. Cancel anytime with no questions asked. You'll
                retain access until your billing period ends.
              </Text>
            </div>

            <div>
              <Text variant="subtitle" size="md" class="font-semibold mb-2">
                Do you offer student discounts?
              </Text>
              <Text variant="body" size="sm" class="text-gray-600">
                Yes! Students get 50% off all paid plans. Contact support with
                your student ID for verification.
              </Text>
            </div>
          </div>
        </div>
      </div> -->

      <!-- final CTA -->
      <!-- <div
        class="text-center bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-12"
      >
        <Text variant="subtitle" size="xl" class="font-bold mb-4">
          Start your journaling journey today
        </Text>
        <Text
          variant="body"
          size="md"
          class="text-gray-600 mb-8 max-w-xl mx-auto"
        >
          Join thousands of users who have transformed their daily reflections
          into meaningful personal growth
        </Text>
        <div
          class="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <UiButton :has-icon="true" icon-location="after" @click="handleLogin">
            <template #icon>
              <MoveRight />
            </template>
            <Text variant="subtitle" size="button">Start Free Trial</Text>
          </UiButton>
          <Text variant="body" size="sm" class="text-gray-500">
            No credit card required • 14-day free trial
          </Text>
        </div>
      </div> -->
    </div>
  </div>
</template>
