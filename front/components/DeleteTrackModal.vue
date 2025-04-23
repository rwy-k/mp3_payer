<template>
    <Modal label="Delete Modal" @close="emit('close')">
        {{ deleteMessage }}
        <Alert v-if="error" :type="AlertType.ERROR" class="my-3">{{ error }}</Alert>
        <Alert v-else-if="success" :type="AlertType.SUCCESS" class="my-3">Deleted successfully!</Alert>
        <Alert v-else-if="loading" :type="AlertType.INFO" class="my-3">Deleting...</Alert>
        <div v-i="!loading && !error && !success" class="flex justify-end gap-2 mt-2">
            <Button @click="emit('close')">Cancel</Button>
            <Button @click="handleDeleteTrack">Delete</Button>
        </div>
    </Modal>
</template>
<script setup lang="ts">
import { AlertType } from '@/types/components';
import Alert from './common/Alert.vue';
import Modal from './common/Modal.vue';
import Button from './common/Button.vue';
import { deleteTrack } from '@/api/tracks';
import type { Track } from '@/types/tracks';

const props = defineProps({
    tracks: {
        type: Array as () => Track[],
        default: () => [],
    },
});
const emit = defineEmits(['close', 'refresh']);

const loading = ref(false);
const success = ref(false);
const error = ref<string>('');

const deleteMessage = computed(() => {
 if (props.tracks.length === 1) {
        return `Are you sure you want to delete this track?`;
    } else {
        return `Are you sure you want to delete these ${props.tracks.length} tracks?`;
    }
});

const handleDeleteTrack = async () => {
    loading.value = true;
    try {
        await Promise.all(props.tracks.map(track => deleteTrack(track.id)));
        success.value = true;
        emit('refresh');
    } catch (err) {
        console.error('Error deleting track:', err);
        error.value = 'Failed to delete track. Please try again.';
    } finally {
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate a delay
        
        emit('close');
        loading.value = false;
        success.value = false;
        error.value = '';
    }
};
</script>