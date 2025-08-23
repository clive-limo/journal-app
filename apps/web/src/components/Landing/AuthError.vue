<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import UiButton from '@/components/Ui/UiButton.vue'
import Text from '@/components/Typography/Text.vue'

const route = useRoute()
const router = useRouter()
const message = route.query.message as string || 'Authentication failed'

const goToLanding = () => {
  router.push({ name: 'Landing' })
}
</script>

<template>
  <div class="h-screen w-full flex items-center justify-center bg-white">
    <div class="text-center max-w-md px-4">
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Authentication Error</h2>
        <p class="text-gray-600">{{ message }}</p>
      </div>
      <UiButton @click="goToLanding">
        <Text variant="subtitle" size="button">Back to Home</Text>
      </UiButton>
    </div>
  </div>
</template>