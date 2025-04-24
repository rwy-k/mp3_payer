<template>
    <div class="flex flex-col gap-4 px-4 w-full">
        <div v-if="currentTrack" class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
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
                    :src="`${currentTrack.audioFile}`"
                    class="hidden"
                    @ended="stopTrack"
                    @timeupdate="updateProgress"
                />
                <div class="flex-1">
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div
                            class="bg-blue-600 h-2 rounded-full"
                            :style="{ width: `${progress}%` }"
                        />
                    </div>
                </div>
                <IconButton @click="togglePlay">
                    {{ isPlaying ? 'pause' : 'play_arrow' }}
                </IconButton>
                <IconButton @click="stopTrack">stop</IconButton>
            </div>
        </div>

        <div v-for="track in props.tracks" :key="track.id" class="flex items-center justify-between gap-2" :data-testid="`track-item-${track.id}`">
            <input 
                :id="track.id"
                type="checkbox"
                :name="'track-' + track.id"
                :value="track.id"
                class="hidden"
                :checked="isChecked(track.id)"
                @change="onTrackSelected(track.id)"
            >
            <label :for="track.id" class="track-info flex items-center w-full">
                <img 
                    :src="track.coverImage || DEFAULT_COVER"
                    alt="cover"
                    class="w-16 h-16 rounded-lg object-cover mr-4"
                >
                <span><b :data-testid="`track-item-${track.id}-artist`">{{ track.artist }}</b> - <span :data-testid="`track-item-${track.id}-title`">{{ track.title }}</span></span>
                <span class="text-sm text-gray-500 ml-auto">{{ track.genres.join(',') }}</span>
            </label>

            <div class="flex">
                <IconButton 
                    v-if="track.audioFile" 
                    :data-testid="`play-track-${track.id}`"
                    @click="playTrack(track)"
                >
                    {{ isCurrentTrack(track) && isPlaying ? 'pause' : 'play_arrow' }}
                </IconButton>
                <IconButton :data-testid="`edit-track-${track.id}`" @click="emit('edit', track)">edit</IconButton>
                <IconButton :data-testid="`delete-track-${track.id}`" @click="emit('upload', track)">upload</IconButton>
                <IconButton :data-testid="`upload-track-${track.id}`" @click="emit('delete', track)">delete</IconButton>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Track } from '@/types/tracks';
import IconButton from './common/IconButton.vue';
import { ref } from 'vue';

const DEFAULT_COVER = 'https://media.istockphoto.com/id/1175435360/vector/music-note-icon-vector-illustration.jpg?s=612x612&w=0&k=20&c=R7s6RR849L57bv_c7jMIFRW4H87-FjLB8sqZ08mN0OU=';

const props = defineProps({
    modelValue: {
        type: Array as () => Track[],
        default: () => [],
    },
    tracks: {
        type: Array as () => Track[],
        required: true,
    },
});

const emit = defineEmits(['update:modelValue', 'edit', 'delete', 'upload']);

const audioPlayer = ref<HTMLAudioElement | null>(null);
const currentTrack = ref<Track | null>(null);
const isPlaying = ref(false);
const progress = ref(0);

const playTrack = (track: Track) => {
    if (isCurrentTrack(track)) {
        togglePlay();
        return;
    }
    
    currentTrack.value = track;
    isPlaying.value = true;
    
    // Need to wait for the next tick for the audio element to be updated
    setTimeout(() => {
        if (audioPlayer.value) {
            audioPlayer.value.play();
        }
    }, 0);
};

const togglePlay = () => {
    if (!audioPlayer.value) return;
    
    if (isPlaying.value) {
        audioPlayer.value.pause();
    } else {
        audioPlayer.value.play();
    }
    isPlaying.value = !isPlaying.value;
};

const stopTrack = () => {
    if (audioPlayer.value) {
        audioPlayer.value.pause();
        audioPlayer.value.currentTime = 0;
    }
    isPlaying.value = false;
    currentTrack.value = null;
    progress.value = 0;
};

const updateProgress = () => {
    if (!audioPlayer.value) return;
    progress.value = (audioPlayer.value.currentTime / audioPlayer.value.duration) * 100;
};

const isCurrentTrack = (track: Track) => {
    return currentTrack.value?.id === track.id;
};

const onTrackSelected = (trackId: string) => {
    if (isChecked(trackId)) {
        emit('update:modelValue', props.modelValue.filter(track => track.id !== trackId));
    } else {
        emit('update:modelValue', [...props.modelValue, props.tracks.find(track => track.id === trackId)]);
    }
};

const isChecked = (trackId: string) => {
    return props.modelValue.some(track => track.id === trackId);
};
</script>

<style lang="scss" scoped>
.track-info {
    font-size: 16px;
    color: #333;
    cursor: pointer;
    transition: color 0.3s;
    padding: 10px;

    &:hover {
        color: #007bff;
    }
}

input[type="checkbox"]:checked + .track-info {
    background-color: var(--color-blue-200);
    border-radius: 5px;
}
</style>