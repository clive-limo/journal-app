<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const error = ref<string>('')

onMounted(async () => {
  const token = route.query.token as string
  const state = route.query.state as string | undefined
  
  if (!token) {
    error.value = 'Missing authentication token'
    setTimeout(() => {
      router.replace({ name: 'auth-error', query: { message: error.value } })
    }, 1000)
    return
  }
  
  try {
    await auth.handleCallback(token, state)
    const to = auth.returnTo || '/home'
    router.replace(to)
  } catch (e: any) {
    error.value = e?.message || 'Authentication failed'
    setTimeout(() => {
      router.replace({ name: 'auth-error', query: { message: error.value } })
    }, 1000)
  }
})
</script>

<template>
  <div class="h-screen w-full flex items-center justify-center bg-white">
    <div class="text-center">
      <div v-if="!error" class="flex flex-col items-center gap-4">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        <p class="text-lg text-gray-700">Signing you in...</p>
      </div>
      <div v-else class="text-red-600">
        <p class="text-lg">{{ error }}</p>
        <p class="text-sm mt-2">Redirecting...</p>
      </div>
    </div>
  </div>
</template>
