<template>
  <section
    class="absolute w-[200px] top-[60px] right-0 flex flex-col rounded-[20px] border-4 border-black/10 bg-orange-200/20 backdrop-blur-md overflow-hidden p-2"
  >
    <div
      class="flex flex-row p-4 cursor-pointer gap-2 hover:bg-orange-500/30 rounded-[8px] transition-all duration-300"
      :onclick="handleSignOut"
    >
      <div
        v-if="isSigningOut"
        class="flex flex-row gap-2 items-center justify-center"
      >
        <div
          class="border-t border-b border-gray-900/50 rounded-full animate-spin w-4 h-4"
        ></div>
        <Text variant="subtitle" size="sm">Loading...</Text>
      </div>
      <div class="flex flex-row gap-2" v-else>
        <LogOut />
        <Text variant="subtitle" size="sm">Logout</Text>
      </div>
    </div>

    <!-- <div
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
        </div> -->
  </section>
</template>

<script setup lang="ts">
import { LogOut } from 'lucide-vue-next';
import Text from '../Typography/Text.vue';
import { ref, Transition } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();
const isSigningOut = ref(false);

const handleSignOut = async () => {
  console.log('sign out');
  isSigningOut.value = true;
  await auth.signout();
  isSigningOut.value = false;
  router.push('/');
};
</script>
