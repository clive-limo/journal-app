<script lang="ts" setup>
import { ref, computed, onMounted, nextTick, type PropType } from 'vue';
import { useAIReflectionStore } from '@/stores/reflections';
import UiButton from '@/components/Ui/UiButton.vue';
import Text from '@/components/Typography/Text.vue';
import {
  Sparkles,
  Send,
  Minimize2,
  Bot,
  User,
  Lightbulb,
  Heart,
  TrendingUp,
  MessageCircle,
  ArrowDown,
  Loader,
} from 'lucide-vue-next';
import { EntryKind } from '@/utils/types';

const props = defineProps({
  entryContent: {
    type: String,
    default: '',
    required: true,
  },
  entryType: {
    type: String as PropType<EntryKind>,
    default: 'WRITE',
  },
  onClose: {
    type: Function,
    required: false,
    default: () => {},
  },
});

// Use the AI Reflection store
const aiStore = useAIReflectionStore();

// Local component state
const isExpanded = ref(false);
const currentInput = ref('');
const messagesContainer = ref<HTMLElement | null>(null);

// Computed properties from store
const hasMessages = computed(() => aiStore.hasMessages);
const chatMessages = computed(() => aiStore.chatMessages);
const currentSuggestions = computed(() => aiStore.currentSuggestions);
const isTyping = computed(() => aiStore.isTyping);

const startReflection = async () => {
  isExpanded.value = true;

  // Initialize chat if no messages exist
  if (!hasMessages.value) {
    await nextTick();
    await aiStore.initializeChat(props.entryContent, props.entryType);
  }
};

const sendMessage = async () => {
  if (!currentInput.value.trim() || isTyping.value) return;

  const messageContent = currentInput.value.trim();
  currentInput.value = '';

  await nextTick();
  scrollToBottom();

  // Send message through the store
  await aiStore.sendUserMessage(messageContent, props.entryContent);

  await nextTick();
  scrollToBottom();
};

const selectSuggestion = async (suggestion: string) => {
  currentInput.value = suggestion;
  await sendMessage();
};

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const collapseChat = () => {
  isExpanded.value = false;
  if (props.onClose) {
    props.onClose();
  }
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};
</script>

<template>
  <transition name="fade-slide">
    <div
      class="flex flex-col rounded-[50px] border-4 border-black/10 bg-orange-200/20 backdrop-blur-md transition-all duration-500 ease-out"
      :class="isExpanded ? 'flex-1' : 'flex-[0.5]'"
    >
      <!-- Collapsed State - Initial Reflection Panel -->
      <div
        v-if="!isExpanded"
        class="flex-1 flex flex-col items-center justify-center text-center gap-4 p-8"
      >
        <div
          class="w-16 h-16 rounded-full bg-gradient-to-br from-[#F1ACB4] to-orange-500 flex items-center justify-center mb-2"
        >
          <Sparkles class="w-8 h-8 text-white" />
        </div>

        <Text variant="title" size="lg">Reflection</Text>
        <Text variant="body" size="sm" class="w-2/3">
          Step back and take a closer look at your entry — with a little help
          from AI to spot patterns and insights...
        </Text>

        <UiButton
          :has-icon="true"
          :is-primary="true"
          icon-location="after"
          @click="startReflection"
          class="mt-2"
        >
          <template #icon>
            <Sparkles class="w-4 h-4" />
          </template>
          <Text variant="subtitle" size="button">{{
            hasMessages ? 'Continue' : 'Start Reflection'
          }}</Text>
        </UiButton>
      </div>

      <!-- Expanded State - Chat Interface -->
      <div v-else class="flex flex-col h-full">
        <!-- Header -->
        <div
          class="flex items-center justify-between p-6 border-b border-black/10"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full bg-gradient-to-br from-[#F1ACB4] to-orange-500 flex items-center justify-center"
            >
              <Bot class="w-5 h-5 text-white" />
            </div>
            <div>
              <Text variant="subtitle" size="sm" class="font-semibold"
                >AI Reflection Guide</Text
              >
              <Text variant="body" size="sm" class="text-gray-600"
                >Let's explore your thoughts together</Text
              >
            </div>
          </div>

          <UiButton
            :has-icon="true"
            icon-location="after"
            size="sm"
            @click="collapseChat"
            class="rounded-full"
          >
            <template #icon>
              <Minimize2 class="w-4 h-4" />
            </template>
          </UiButton>
        </div>

        <!-- Messages Area -->
        <div
          ref="messagesContainer"
          class="flex-1 overflow-y-auto p-4 flex flex-col gap-2 space-y-4 min-h-0"
          style="max-height: calc(100vh - 300px)"
        >
          <!-- Message Bubbles -->
          <div
            v-for="message in chatMessages"
            :key="message.id"
            class="flex gap-3"
            :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
          >
            <!-- Avatar -->
            <div
              v-if="message.role === 'assistant'"
              class="w-8 h-8 rounded-full bg-gradient-to-br from-[#F1ACB4] to-orange-500 flex items-center justify-center flex-shrink-0"
            >
              <Bot class="w-4 h-4 text-white" />
            </div>

            <!-- Message Content -->
            <div
              class="max-w-[80%] rounded-2xl px-4 py-3 break-words"
              :class="
                message.role === 'user'
                  ? 'bg-black text-white rounded-br-md'
                  : 'bg-white/80 text-gray-800 rounded-bl-md shadow-sm'
              "
            >
              <Text
                variant="body"
                size="sm"
                :class="
                  message.role === 'user' ? 'text-white' : 'text-gray-800'
                "
              >
                {{ message.content }}
              </Text>

              <!-- Timestamp -->
              <Text
                variant="body"
                size="sm"
                class="mt-1 opacity-70"
                :class="
                  message.role === 'user' ? 'text-white' : 'text-gray-600'
                "
              >
                {{ formatTime(message.timestamp) }}
              </Text>

              <!-- Suggestions -->
              <div
                v-if="message.role === 'assistant' && message.suggestions"
                class="flex flex-wrap gap-2 mt-3"
              >
                <button
                  v-for="suggestion in message.suggestions"
                  :key="suggestion"
                  @click="selectSuggestion(suggestion)"
                  class="px-3 py-1 text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-full transition-colors duration-200"
                >
                  {{ suggestion }}
                </button>
              </div>
            </div>

            <!-- User Avatar -->
            <div
              v-if="message.role === 'user'"
              class="w-8 h-8 rounded-full bg-black flex items-center justify-center flex-shrink-0"
            >
              <User class="w-4 h-4 text-white" />
            </div>
          </div>

          <!-- Typing Indicator -->
          <div v-if="isTyping" class="flex items-center gap-3">
            <div
              class="w-8 h-8 rounded-full bg-gradient-to-br from-[#F1ACB4] to-orange-500 flex items-center justify-center"
            >
              <Bot class="w-4 h-4 text-white" />
            </div>
            <div
              class="bg-white/80 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm"
            >
              <div class="flex gap-1">
                <div
                  class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style="animation-delay: 0ms"
                />
                <div
                  class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style="animation-delay: 150ms"
                />
                <div
                  class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style="animation-delay: 300ms"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Suggestions (when no messages) -->
        <div
          v-if="!hasMessages && !isTyping"
          class="p-4 border-t border-black/10"
        >
          <Text variant="body" size="sm" class="text-gray-600 mb-3"
            >Starting reflection settion...</Text
          >
          <div class="flex flex-wrap gap-2">
            <button
              v-for="suggestion in currentSuggestions"
              :key="suggestion"
              @click="selectSuggestion(suggestion)"
              class="px-3 py-2 text-sm bg-white/60 hover:bg-white/80 text-gray-700 rounded-full transition-colors duration-200 border border-black/10"
            >
              {{ suggestion }}
            </button>
          </div>
        </div>

        <!-- Input Area -->
        <div class="p-4 border-t border-black/10">
          <div class="flex gap-3 items-end justify-center">
            <div class="flex-1 relative">
              <input
                v-model="currentInput"
                @keyup.enter="sendMessage"
                :disabled="isTyping"
                placeholder="Share your thoughts or ask a question..."
                class="w-full px-4 py-3 font-firacode rounded-2xl border-2 border-black/20 bg-white/80 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none placeholder:font-firacode"
              />
            </div>

            <UiButton
              :has-icon="true"
              icon-location="after"
              :is-primary="true"
              :disabled="!currentInput.trim() || isTyping"
              @click="sendMessage"
            >
              <template #icon>
                <Send v-if="!isTyping" class="w-5 h-5" />
                <Loader v-else class="w-5 h-5 animate-spin" />
              </template>
            </UiButton>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* Bounce animation for typing dots */
@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-0.5rem);
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}
</style>
