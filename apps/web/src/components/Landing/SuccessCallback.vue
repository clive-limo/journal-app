<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import UiButton from '@/components/Ui/UiButton.vue';
import Text from '@/components/Typography/Text.vue';
import { CheckCircle, ArrowRight, Loader } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const route = useRoute();

const isProcessing = ref(true);
const authToken = ref<string | null>(null);
const error = ref<string | null>(null);

const auth = useAuthStore();

const processAuthToken = async () => {
  try {
    // Get token from URL params

    const token = route.query.token as string;
    const state = route.query.state as string | undefined;

    if (!token) {
      error.value = 'Missing authentication token';
      setTimeout(() => {
        router.replace({ name: 'auth-error', query: { message: error.value } });
      }, 1000);
      return;
    }

    try {
      await auth.handleCallback(token, state);
      const to = auth.returnTo || '/home';
      setTimeout(() => {
        router.replace(to);
      }, 2000);
    } catch (e: any) {
      error.value = e?.message || 'Authentication failed';
      setTimeout(() => {
        router.replace({ name: 'auth-error', query: { message: error.value } });
      }, 1000);
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Authentication failed';
    isProcessing.value = false;
  }
};

const redirectToDashboard = () => {
  router.push('/home');
};

const redirectToLogin = () => {
  router.push('/login');
};

onMounted(() => {
  processAuthToken();
});
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-orange-100/50 to-blue-100/50"
  >
    <div class="w-full max-w-md">
      <!-- Success State -->
      <div
        v-if="!isProcessing && !error"
        class="flex flex-col items-center justify-center gap-6 p-8 rounded-[50px] border-4 border-green-300 bg-green-100/30 backdrop-blur-xl text-center transition-all duration-500"
      >
        <!-- Success Icon with Animation -->
        <div class="relative">
          <div
            class="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center animate-bounce"
          >
            <CheckCircle class="w-10 h-10 text-white" />
          </div>
          <div
            class="absolute inset-0 rounded-full border-4 border-green-400 animate-ping opacity-75"
          />
        </div>

        <!-- Success Message -->
        <div class="space-y-2">
          <Text variant="title" size="lg" class="text-green-800">
            Authentication Successful!
          </Text>
          <Text variant="body" size="sm" class="text-green-700">
            Welcome back! You've been successfully logged in.
          </Text>
        </div>

        <!-- Auto-redirect Notice -->
        <div class="px-4 py-2 bg-green-200/50 rounded-full">
          <Text variant="body" size="sm" class="text-green-700">
            Redirecting to dashboard in 3 seconds...
          </Text>
        </div>

        <!-- Manual Redirect Button -->
        <UiButton
          :has-icon="true"
          :is-primary="true"
          icon-location="after"
          @click="redirectToDashboard"
          class="w-full"
        >
          <template #icon>
            <ArrowRight class="w-4 h-4" />
          </template>
          <Text variant="subtitle" size="button">Continue to Dashboard</Text>
        </UiButton>
      </div>

      <!-- Processing State -->
      <div
        v-else-if="isProcessing && !error"
        class="flex flex-col items-center justify-center gap-6 p-8 rounded-[50px] border-4 border-blue-300 bg-blue-100/30 text-center"
      >
        <!-- Loading Icon -->
        <div
          class="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center"
        >
          <Loader class="w-10 h-10 text-white animate-spin" />
        </div>

        <!-- Processing Message -->
        <div class="space-y-2">
          <Text variant="title" size="lg" class="text-blue-800">
            Authenticating...
          </Text>
          <Text variant="body" size="sm" class="text-blue-700">
            Please wait while we verify your credentials.
          </Text>
        </div>

        <!-- Loading Dots -->
        <div class="flex gap-1">
          <div
            class="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
            style="animation-delay: 0ms"
          />
          <div
            class="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
            style="animation-delay: 150ms"
          />
          <div
            class="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
            style="animation-delay: 300ms"
          />
        </div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="flex flex-col items-center justify-center gap-6 p-8 rounded-[50px] border-4 border-red-300 bg-red-100/30 text-center"
      >
        <!-- Error Icon -->
        <div
          class="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center"
        >
          <Text variant="title" size="xl" class="text-white">!</Text>
        </div>

        <!-- Error Message -->
        <div class="space-y-2">
          <Text variant="title" size="lg" class="text-red-800">
            Authentication Failed
          </Text>
          <Text variant="body" size="sm" class="text-red-700">
            {{ error }}
          </Text>
        </div>

        <!-- Retry Button -->
        <UiButton
          :has-icon="true"
          :is-primary="true"
          icon-location="after"
          @click="redirectToLogin"
          class="w-full"
        >
          <template #icon>
            <ArrowRight class="w-4 h-4" />
          </template>
          <Text variant="subtitle" size="button">Back to Login</Text>
        </UiButton>
      </div>
    </div>
  </div>
</template>
