<template>
    <!-- Player inline -->
    <div v-if="currentTrack" :data-testid="`audio-player-${currentTrack.id}`" class="fixed z-10 bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div class="max-w-screen-xl mx-auto flex items-center gap-4">
            <img 
                :src="currentTrack.coverImage || DEFAULT_COVER"
                alt="Now playing"
                class="w-12 h-12 rounded-lg object-cover"
            >
            <div class="flex-1">
                <div class="font-bold">{{ currentTrack.title }}</div>
                <div class="text-sm text-gray-600">{{ currentTrack.artist }}</div>
            </div>
            <audio
                ref="audioPlayer"
                :src="`${serverUrl}/api/files/${currentTrack.audioFile}`"
                class="hidden"
                @ended="stopTrack"
                @timeupdate="updateProgress"
                @play="handlePlay"
                @pause="handlePause"
                @error="handleAudioError"
            />
            <div class="flex-1">
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div
                        class="bg-blue-600 h-2 rounded-full"
                        :style="{ width: `${progress}%` }"
                    />
                </div>
            </div>
            <IconButton :data-testid="`play-button-${currentTrack.id}`" @click="togglePlay">
                {{ isPlaying ? 'pause' : 'play_arrow' }}
            </IconButton>
            <IconButton :data-testid="`stop-button-${currentTrack.id}`" @click="stopTrack">stop</IconButton>
        </div>
    </div>
</template>
<script setup lang="ts">
import IconButton from './IconButton.vue';
import { useTracksStore } from '@/stores/tracks';
import type { Track } from '~/types/tracks';
import { DEFAULT_COVER } from '../constants';

const store = useTracksStore();

const serverUrl = import.meta.env.VITE_SERVER_URL;

const audioPlayer = ref<HTMLAudioElement | null>(null);
const progress = ref(0);
const audioError = ref<string | null>(null);
const isPlaying = ref(false);
const isCurrentTrack = ref(true);

const currentTrack = computed({
    get: () => store.getCurrentTrack,
    set: (track: Track|null) => {
        store.setCurrentTrack(track);
    },
});

const playTrack = (track: Track) => {
    if (isCurrentTrack.value) {
        togglePlay();
        return;
    }
    
    currentTrack.value = track;
    isPlaying.value = true;
    audioError.value = null;
    
    setTimeout(() => {
        if (audioPlayer.value) {
            audioPlayer.value.play().catch(error => {
                audioError.value = error.message;
                isPlaying.value = false;
                currentTrack.value = null;
            });
        }
    }, 0);
};

const togglePlay = () => {
    if (!audioPlayer.value) return;
    
    isPlaying.value = !isPlaying.value;
    
    if (isPlaying.value) {
        audioPlayer.value.play().catch(error => {
            audioError.value = error.message;
            isPlaying.value = false;
        });
    } else {
        audioPlayer.value.pause();
    }
};

const stopTrack = () => {
    if (audioPlayer.value) {
        audioPlayer.value.pause();
        audioPlayer.value.currentTime = 0;
    }
    isPlaying.value = false;
    currentTrack.value = null;
    progress.value = 0;
    audioError.value = null;
};

const updateProgress = () => {
    if (!audioPlayer.value) return;
    progress.value = (audioPlayer.value.currentTime / audioPlayer.value.duration) * 100;
};

const handlePlay = () => {
    isPlaying.value = true;
    audioError.value = null;
};

const handlePause = () => {
    isPlaying.value = false;
};

const handleAudioError = (event: Event) => {
    const audioElement = event.target as HTMLAudioElement;
    audioError.value = `Error playing audio: ${audioElement.error?.message || 'Unknown error'}`;
    isPlaying.value = false;
    currentTrack.value = null;
};

watch(() => store.getCurrentTrack, (newTrack: Track|null) => {
    isCurrentTrack.value = false;
    if (newTrack) playTrack(newTrack as Track);
}, { immediate: true });

onUnmounted(() => {
    if (audioPlayer.value) {
        audioPlayer.value.pause();
    }

    store.setCurrentTrack(null);
});
</script>