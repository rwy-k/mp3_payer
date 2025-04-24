<template>
    <div class="flex flex-col gap-4 px-4 w-full">
        <div v-for="track in props.tracks" :key="track.id" class="flex items-center justify-between gap-2" :data-testid="`track-item-${track.id}`">
            <input 
                :id="track.id"
                type="checkbox"
                :name="'track-' + track.id"
                :value="track.id"
                class="hidden"
                :checked="isChecked(track.id)"
                :data-testid="`track-checkbox-${track.id}`"
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
                    :class="{ 'text-blue-500': isCurrentTrack(track) && isPlaying }"
                    @click="handlePlay(track)"
                >
                    {{ isCurrentTrack(track) && isPlaying(track) ? 'pause' : 'play_arrow' }}
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
import { useTracksStore } from '@/stores/tracks';
import { DEFAULT_COVER } from './constants';

const store = useTracksStore();

const props = defineProps({
    modelValue: {
        type: Array as () => Track[],
        default: () => [],
    },
    tracks: {
        type: Array as () => Track[],
        required: true,
    },
    playingTrack: {
        type: Object as () => Track | null,
        default: null,
    },
});

const emit = defineEmits(['update:modelValue', 'edit', 'delete', 'upload', 'play']);

const isPlaying = (track: Track) => {
    return props.playingTrack?.id === track.id;
};
const isCurrentTrack = (track: Track) => {
    return store.getCurrentTrack?.id === track.id;
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

const handlePlay = (track: Track) => {
    if (isCurrentTrack(track)) {
        store.togglePlay();
    } else {
        store.setCurrentTrack(track);
        store.playTrack();
    }
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

.text-blue-500 {
    color: #3b82f6;
}
</style>