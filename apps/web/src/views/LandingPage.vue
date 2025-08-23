<script setup lang="ts">
import JournalCards from '@/components/Landing/JournalCards.vue';
import Text from '@/components/Typography/Text.vue';
import UiButton from '@/components/Ui/UiButton.vue';
import router from '@/router';
import { cardDetails } from '@/utils/data';
import { MoveRight, UserRound } from 'lucide-vue-next';
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const auth = useAuthStore()
const { user, defaultJournal, isLoading } = storeToRefs(auth)

const handleLogin = () => {
  auth.loginWithGoogle()
};

const createEntry = () => {
  if (defaultJournal.value) {
    // Navigate to create entry page with the default journal ID
    router.push(`/journals/${defaultJournal.value.id}/entries/new`)
  }
}


const viewEntries = () => {
  if (defaultJournal.value) {
    router.push(`/journals/${defaultJournal.value.id}/entries`)
  }
}

onMounted(() => {
  // User data including default journal is already loaded from auth store
  console.log('User:', user.value)
  console.log('Default Journal:', defaultJournal.value)
})

const goToHome = () => {
  router.push({ name: 'Home' })
}
</script>

<template>
  <div class="h-screen w-full flex flex-col bg-white">
    <!-- header -->
    <div class="w-full flex flex-row justify-between items-center px-16">
      <img
        src="@/assets/images/echo_journal_logo.png"
        class="h-[89px] w-[171px]"
      />
      <UiButton
        :has-icon="true"
        icon-location="after"
        @click="() => {}"
        :delay="4000"
      >
        <template #icon>
          <UserRound />
        </template>
        <Text variant="subtitle" size="button">Login</Text>
      </UiButton>
    </div>
    <!-- body -->
    <div
      class="flex-1 flex flex-col items-center justify-center py-4 px-4 sm:py-6 sm:px-6 lg:px-8"
    >
      <div
        class="flex flex-col z-10 items-center justify-center text-center gap-5"
      >
        <h2
          class="text-[72px] font-playfair tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl"
        >
          <span
            >Reflect, understand, <br />
            and grow every day</span
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
          <UiButton
            :has-icon="true"
            icon-location="after"
            @click="handleLogin"
            :delay="2000"
          >
            <template #icon>
              <MoveRight />
            </template>
            <Text variant="subtitle" size="button">Get Started</Text>
          </UiButton>
        </div>
        <!-- journal cards -->
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
      </div>
    </div>
  </div>
</template>

<style scoped></style>
