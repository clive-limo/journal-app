<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import UiButton from '@/components/Ui/UiButton.vue';
import Text from '@/components/Typography/Text.vue';
import {
  Mic,
  Square,
  Save,
  Pause,
  Play,
  Sparkles,
  SquareStop,
  Mic2,
} from 'lucide-vue-next';

const props = defineProps({
  onSave: {
    type: Function,
    required: true,
  },
  onDiscard: {
    type: Function,
    required: true,
  },
});

defineEmits(['updateEntry']);

// Recording states
const isRecording = ref(false);
const isPaused = ref(false);
const audioBlob = ref<Blob | null>(null);
const recordingTime = ref(0);
const audioLevel = ref(0);

// MediaRecorder variables
let mediaRecorder: MediaRecorder | null = null;
let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let microphone: MediaStreamAudioSourceNode | null = null;
let animationFrame: number | null = null;
let recordingTimer: NodeJS.Timeout | null = null;
const audioChunks: Blob[] = [];

// Voice wave animation data
const waveData = ref(Array(20).fill(0));

const initializeAudio = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    // Set up MediaRecorder
    mediaRecorder = new MediaRecorder(stream, {
      mimeType: MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4',
    });

    // Set up audio analysis for wave visualization
    audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();
    microphone = audioContext.createMediaStreamSource(stream);

    analyser.fftSize = 64;
    microphone.connect(analyser);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      setAudioBlob(audioBlob);
      audioChunks.length = 0; // Clear chunks
    };
  } catch (error) {
    console.error('Error accessing microphone:', error);
    alert('Unable to access microphone. Please check permissions.');
  }
};

const analyzeAudio = () => {
  if (!analyser) return;

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);

  // Calculate average volume
  const average = dataArray.reduce((a, b) => a + b) / bufferLength;
  audioLevel.value = average;

  // Update wave data for visualization
  waveData.value = waveData.value.map((_, index) => {
    const frequency = dataArray[index] || 0;
    return Math.min((frequency / 255) * 100, 100);
  });

  if (isRecording.value && !isPaused.value) {
    animationFrame = requestAnimationFrame(analyzeAudio);
  }
};

const startRecording = async () => {
  if (!mediaRecorder) {
    await initializeAudio();
  }

  if (mediaRecorder && mediaRecorder.state === 'inactive') {
    audioChunks.length = 0; // Clear previous chunks
    recordingTime.value = 0;
    audioBlob.value = null;

    mediaRecorder.start(100); // Record in 100ms chunks
    isRecording.value = true;
    isPaused.value = false;

    // Start timer
    recordingTimer = setInterval(() => {
      recordingTime.value += 1;
    }, 1000);

    // Start audio analysis
    analyzeAudio();
  }
};

const pauseRecording = () => {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.pause();
    isPaused.value = true;

    if (recordingTimer) {
      clearInterval(recordingTimer);
    }

    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  }
};

const resumeRecording = () => {
  if (mediaRecorder && mediaRecorder.state === 'paused') {
    mediaRecorder.resume();
    isPaused.value = false;

    // Resume timer
    recordingTimer = setInterval(() => {
      recordingTime.value += 1;
    }, 1000);

    // Resume audio analysis
    analyzeAudio();
  }
};

const stopRecording = () => {
  if (
    mediaRecorder &&
    (mediaRecorder.state === 'recording' || mediaRecorder.state === 'paused')
  ) {
    mediaRecorder.stop();
    isRecording.value = false;
    isPaused.value = false;

    if (recordingTimer) {
      clearInterval(recordingTimer);
      recordingTimer = null;
    }

    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }

    // Reset wave data
    waveData.value = Array(20).fill(0);
  }
};

const setAudioBlob = (blob: Blob) => {
  audioBlob.value = blob;
};

const saveEntry = () => {
  if (audioBlob.value) {
    props.onSave(audioBlob.value);
  }
};

const discardRecording = () => {
  audioBlob.value = null;
  props.onDiscard();
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const getRecordingStatus = () => {
  if (isPaused.value) return 'Recording paused';
  if (isRecording.value) return 'Recording...';
  return 'Tap to start recording your entry';
};

onMounted(() => {
  // Initialize on mount if needed
});

onUnmounted(() => {
  // Cleanup
  if (recordingTimer) clearInterval(recordingTimer);
  if (animationFrame) cancelAnimationFrame(animationFrame);
  if (audioContext) audioContext.close();
});
</script>

<template>
  <div class="flex-1 flex flex-row gap-4">
    <!-- Voice Recorder -->
    <div
      class="flex-1 flex flex-col items-center justify-center gap-6 p-8 rounded-[50px] text-xl text-black/50 font-firacode border-4 transition-all duration-300"
      :class="
        isRecording
          ? 'border-red-300 bg-red-100/30'
          : 'border-black/10 bg-orange-200/20'
      "
    >
      <!-- Main Record Button -->
      <div class="relative">
        <UiButton
          :has-icon="true"
          :is-primary="true"
          icon-location="after"
          size="lg"
          class=""
          @click="isRecording ? stopRecording() : startRecording()"
        >
          <template #icon>
            <SquareStop v-if="isRecording" />
            <Mic v-else />
          </template>
        </UiButton>

        <!-- Pulsing ring when recording -->
        <div
          v-if="isRecording && !isPaused"
          class="absolute inset-0 rounded-full border-4 border-red-400 animate-ping"
        />
        <div
          v-if="isRecording && !isPaused"
          class="absolute inset-0 rounded-full border-4 border-red-500 animate-pulse delay-200"
        />
        <div
          v-if="isRecording && !isPaused"
          class="absolute inset-0 rounded-full border-4 border-red-600 animate-ping delay-400"
        />
      </div>

      <!-- Recording Status -->
      <div class="text-center">
        <Text variant="body" size="sm" class="mb-2">
          {{ getRecordingStatus() }}
        </Text>

        <div v-if="isRecording || audioBlob" class="text-lg font-mono">
          {{ formatTime(recordingTime) }}
        </div>
      </div>

      <!-- Voice Wave Visualization -->
      <div
        v-if="isRecording && !isPaused"
        class="flex items-center justify-center gap-1 h-16"
      >
        <div
          v-for="(height, index) in waveData"
          :key="index"
          class="w-1 bg-gradient-to-t from-red-400 to-red-600 rounded-full transition-all duration-100 ease-out"
          :style="{ height: `${Math.max(height * 0.6, 4)}px` }"
        />
      </div>

      <!-- Pause Button (shown during recording) -->
      <div v-if="isRecording" class="flex gap-4">
        <UiButton
          :has-icon="true"
          icon-location="after"
          class="rounded-full h-12 w-12"
          @click="isPaused ? resumeRecording() : pauseRecording()"
        >
          <template #icon>
            <component :is="isPaused ? Play : Pause" class="w-5 h-5" />
          </template>
          <Text variant="subtitle" size="button">{{
            isPaused ? 'Resume' : 'Pause'
          }}</Text>
        </UiButton>
      </div>

      <!-- Audio Playback and Save (shown after recording) -->
      <div v-if="audioBlob" class="flex flex-col items-center gap-4 w-full">
        <audio
          controls
          :src="URL.createObjectURL(audioBlob)"
          class="w-full max-w-md"
        />

        <div class="flex items-center gap-4">
          <UiButton
            :has-icon="true"
            :is-primary="true"
            icon-location="before"
            @click="saveEntry"
          >
            <template #icon>
              <Save class="w-4 h-4" />
            </template>
            <Text variant="subtitle" size="button">Save</Text>
          </UiButton>

          <UiButton :has-icon="false" @click="discardRecording">
            <Text variant="subtitle" size="button">Discard</Text>
          </UiButton>
        </div>
      </div>
    </div>

    <!-- Reflections panel -->
    <transition name="fade-slide">
      <div
        class="flex-[0.5] flex flex-col p-8 rounded-[50px] border-4 border-black/10 bg-orange-200/20 backdrop-blur-md"
      >
        <div
          class="flex-1 flex flex-col items-center justify-center text-center gap-4"
        >
          <Text variant="title" size="lg"> Reflection </Text>
          <Text variant="body" size="sm" class="w-2/3"
            >Step back and take a closer look at your entry — with a little help
            from AI to spot patterns and insights...</Text
          >
          <UiButton
            :has-icon="true"
            :is-primary="true"
            icon-location="after"
            @click="() => {}"
          >
            <template #icon>
              <Sparkles />
            </template>
            <p>Start</p>
          </UiButton>
        </div>
      </div>
    </transition>
  </div>
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
</style>
