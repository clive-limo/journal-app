<script setup lang="ts">
import JournalEntry from '@/components/Home/JournalEntry.vue';
import Text from '@/components/Typography/Text.vue';
import UiButton from '@/components/Ui/UiButton.vue';
import {
  ArrowLeft,
  BookText,
  HamburgerIcon,
  Mic,
  Palette,
  PencilLine,
  Squirrel,
  UserRound,
} from 'lucide-vue-next';

import { ref, nextTick, Transition } from 'vue';

const startButtonClicked = ref(false);
const journalStarted = ref(false);
const journalType = ref('write');
const buttonsVisible = ref([false, false, false]);

const showSidebar = ref(false);

const handleStartClick = async () => {
  startButtonClicked.value = true;

  // Wait for the container to start animating
  await nextTick();

  // Stagger the button animations
  setTimeout(() => (buttonsVisible.value[0] = true), 200);
  setTimeout(() => (buttonsVisible.value[1] = true), 350);
  setTimeout(() => (buttonsVisible.value[2] = true), 500);
};

const getButtonAnimation = (index: number) => {
  const baseClasses = 'transition-all duration-500 ease-out';
  const visibleClasses = 'opacity-100 translate-y-0 scale-100';
  const hiddenClasses = 'opacity-0 translate-y-4 scale-95';

  return `${baseClasses} ${buttonsVisible.value[index] ? visibleClasses : hiddenClasses}`;
};
</script>

<template>
  <main class="flex flex-row p-4 gap-2">
    <!-- sidebar -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-800 ease-in-out cubic-bezier(1, 0.5, 0.8, 1)"
      enter-from-class="transform -translate-x-20 opacity-0"
      leave-to-class="transform -translate-x-20 opacity-0"
    >
      <section
        v-if="showSidebar"
        class="w-[300px] mr-5 flex flex-col p-8 rounded-[50px] border-4 border-black/10 bg-orange-200/20 backdrop-blur-md"
      >
        <Text variant="title" size="lg">Recent Entries</Text>

        <div
          class="relative flex flex-col items-center justify-center gap-4 pt-20"
        >
          <div
            class="bg-orange-300/60 size-[150px] rounded-4xl flex items-center justify-center"
          >
            <Squirrel :size="60" />
          </div>
          <Text variant="title" size="xl" class="z-10">No Entries</Text>
          <Text variant="body" size="sm" class="z-10">
            You haven't added any journal entries yet.
          </Text>
          <div
            class="absolute bottom-32 left-2 h-8 w-[150px] bg-orange-500"
          ></div>
        </div>
      </section>
    </Transition>

    <!-- main body -->
    <section class="flex-1 flex flex-col transition-all duration-500">
      <div class="flex flex-col transition-all duration-500">
        <!-- main header -->
        <div
          v-if="!journalStarted"
          class="flex flex-row items-center justify-between pb-4"
        >
          <UiButton
            :has-icon="true"
            icon-location="after"
            @click="
              () => {
                showSidebar = !showSidebar;
              }
            "
          >
            <template #icon>
              <HamburgerIcon />
            </template>
          </UiButton>

          <UiButton :has-icon="true" icon-location="after" @click="() => {}">
            <template #icon>
              <UserRound />
            </template>
          </UiButton>
        </div>

        <!-- journaling header -->
        <div v-else class="flex flex-row items-center justify-between pb-4">
          <UiButton
            :has-icon="true"
            icon-location="after"
            @click="
              () => {
                journalStarted = !journalStarted;
              }
            "
          >
            <template #icon>
              <ArrowLeft />
            </template>
          </UiButton>
        </div>
      </div>

      <!-- first journal -->

      <div
        v-if="!journalStarted"
        class="flex-1 flex flex-col transition-all duration-500"
      >
        <div
          class="flex-1 flex flex-col items-center justify-center gap-4 pb-32"
        >
          <Text variant="subtitle" size="md">WEDNESDAY, AUGUST 17TH</Text>
          <Text variant="title" size="xl" class="text-[56px] font-black">
            Good Morning, Clive
          </Text>

          <UiButton
            :has-icon="true"
            icon-location="after"
            @click="handleStartClick"
            :delay="1000"
            :is-primary="true"
            :class="
              startButtonClicked
                ? 'opacity-50 scale-95 pointer-events-none'
                : ''
            "
          >
            <template #icon>
              <BookText />
            </template>
            <Text variant="subtitle" size="button">
              {{
                startButtonClicked
                  ? 'Choose an option below...'
                  : 'Write Your First Journal'
              }}
            </Text>
          </UiButton>

          <!-- Options container with entrance animation -->
          <div
            class="flex flex-row gap-5 py-5 transition-all duration-700 ease-out"
            :class="
              startButtonClicked
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
            "
          >
            <!-- Write button -->
            <UiButton
              :has-icon="true"
              icon-location="after"
              @click="
                () => {
                  startButtonClicked = false;
                  journalStarted = true;
                  journalType = 'write';
                }
              "
              :delay="1500"
              :class="getButtonAnimation(0)"
            >
              <template #icon>
                <PencilLine />
              </template>
              <Text variant="subtitle" size="button">Write</Text>
            </UiButton>

            <!-- Draw button -->
            <UiButton
              :has-icon="true"
              icon-location="after"
              @click="
                () => {
                  startButtonClicked = false;
                  journalStarted = true;
                  journalType = 'draw';
                }
              "
              :delay="1500"
              :class="getButtonAnimation(1)"
            >
              <template #icon>
                <Palette />
              </template>
              <Text variant="subtitle" size="button">Draw</Text>
            </UiButton>

            <!-- Talk button -->
            <UiButton
              :has-icon="true"
              icon-location="after"
              @click="
                () => {
                  startButtonClicked = false;
                  journalStarted = true;
                  journalType = 'talk';
                }
              "
              :delay="1500"
              :class="getButtonAnimation(2)"
            >
              <template #icon>
                <Mic />
              </template>
              <Text variant="subtitle" size="button">Talk</Text>
            </UiButton>
          </div>

          <!-- Optional: Add a subtle glow effect when options are revealed -->
          <div
            v-if="startButtonClicked"
            class="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-lg animate-pulse pointer-events-none"
          />
        </div>
      </div>

      <div v-else-if="journalStarted" class="flex-1 flex flex-col p-4">
        <JournalEntry :entryType="journalType" />
      </div>
    </section>
  </main>
</template>

<style scoped>
/* Optional: Add a subtle bounce effect */
.animate-bounce-subtle {
  animation: bounce-subtle 0.6s ease-out;
}

@keyframes bounce-subtle {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-2px) scale(1.02);
  }
}
</style>
