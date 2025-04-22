<template>
    <div class="flex flex-col gap-4 my-4 px-4 w-full">
        <div v-for="track in props.tracks" :key="track.id" class="flex items-center justify-between gap-2">
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
                <b>{{ track.artist }}</b> - {{ track.title }}
            </label>

            <div class="flex">
                <IconButton @click="emit('edit', track)">edit</IconButton>
                <IconButton @click="emit('upload', track)">upload</IconButton>
                <IconButton @click="emit('delete', track)">delete</IconButton>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import type { Track } from '~/types/tracks';
import IconButton from './common/IconButton.vue';

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

const onTrackSelected = (trackId: string) => {
    if (isChecked(trackId)) {
        // If the track is already selected, remove it from the modelValue
        emit('update:modelValue', props.modelValue.filter(track => track.id !== trackId));
    } else {
        // If the track is not selected, add it to the modelValue
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

    &:before {
        content: '';
        display: inline-block;
        width: 20px;
        height: 20px;
        background-color: #f0f0f0;
        border-radius: 4px;
        margin-right: 10px;
    }
}

input[type="checkbox"]:checked + .track-info:before {
    background-color: #7db3ed;
}
input[type="checkbox"]:checked + .track-info {
    background-color: var(--color-blue-200);
    border-radius: 5px;
}
</style>