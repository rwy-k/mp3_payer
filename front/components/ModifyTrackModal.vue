<template>
    <Modal :label="props.trackToEdit ? 'Edit track' : 'Add new track'" @close="emit('close')">
        <div>
            <form class="flex flex-col gap-4" @submit.prevent="handleFormSubmit">
                <InputField 
                    v-model="track.title"
                    label="Title"
                    placeholder="Enter title"
                    :disabled="inputsDisabled"
                    required
                /> 
                <InputField
                    v-model="track.artist"
                    label="Artist"
                    placeholder="Enter artist"
                    :disabled="inputsDisabled"
                    required
                />
                <InputField
                    v-model="track.album"
                    label="Album"
                    placeholder="Enter album"
                    :disabled="inputsDisabled"
                    required
                />
                <Dropdown
                    v-model="trackGenres"
                    :options="availableGenres"
                    label="Genres"
                    :disabled="inputsDisabled"
                    placeholder="Enter genre"
                />
                <div class="flex gap-1 items-end">
                    <InputField
                        v-model="track.coverImage"
                        label="Cover"
                        :disabled="inputsDisabled"
                        placeholder="Enter image URL or "
                    />
                    <Button
                        type="button"
                        :disabled="inputsDisabled"
                        @click="uploadFile"
                    >Upload</Button>
                    <input 
                        ref="fileInput" 
                        type="file" 
                        accept="image/*" 
                        class="hidden" 
                        @change="onFileSelected" 
                    >
                </div>
                
                <Button v-show="!loading && !error && !success" type="submit">{{ props.trackToEdit ? 'Save changes' : 'Create track' }}</Button>
            </form>
            <Alert v-if="error" :type="AlertType.ERROR">{{ error }}</Alert>
            <Alert v-else-if="success" :type="AlertType.SUCCESS">Track {{props.trackToEdit ? 'updated' : 'created'}} successfully!</Alert>
            <Alert v-else-if="loading" :type="AlertType.INFO">Saving track...</Alert>
        </div>
    </Modal>
</template>
<script setup lang="ts">
import type { Track } from '~/types/tracks';
import { AlertType } from '~/types/components';
import InputField from './common/InputField.vue';
import Button from './common/Button.vue';
import Dropdown from './common/Dropdown.vue';
import Alert from './common/Alert.vue';
import Modal from './common/Modal.vue';
import { addTrack, updateTrack } from '~/api/tracks';
import { getGenres } from '~/api/genres';

const props = defineProps({
    trackToEdit: {
        type: Object as () => Track | null,
        default: null,
    },
});
const emit = defineEmits(['close', 'refresh']);

const loading = ref(false);
const error = ref<string | null>(null);
const success = ref(false);
const track = ref<Track>({
    title: '',
    artist: '',
    id: `${Math.round(Math.random() * 10**13)}`,
    album: '',
    genres: [],
});
const availableGenres = ref<{label: string; value: string;}[]>([])
const fileInput = ref<HTMLInputElement | null>(null);

const trackGenres = computed({
    get: () => track.value.genres.map((genre) => ({
        label: genre[0].toUpperCase() + genre.slice(1),
        value: genre,
    })),
    set: (value) => {
        track.value.genres = value.map((genre) => genre.value);
    },
})

const inputsDisabled = computed(() => {
    return loading.value || success.value;
});

const uploadFile = async () => {
    if (fileInput.value) {
        fileInput.value.click();
    }
};

const onFileSelected = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
        const file = target.files[0];
        // Create URL for the uploaded file
        const imageUrl = URL.createObjectURL(file);
        track.value.coverImage = imageUrl;
        
        // Optional: Display preview or file name
        console.log(`File selected: ${file.name}`);
    }
};

const handleFormSubmit = async () => {
    loading.value = true;
    try {
        if (props.trackToEdit) {
            await updateTrack(track.value)
        } else {
            await addTrack(track.value);
        }
        success.value = true;
    } catch (err: unknown) {
        console.error('Error saving track:', err);
        error.value = 'Failed to save track';
    } finally {
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate a delay
        
        loading.value = false;
        error.value = null;
        success.value = false;
        emit('close');
        emit('refresh');
    }
};

watch(() => props.trackToEdit, (newValue) => {
    if (newValue) {
        track.value = { ...newValue };
    } else {
        track.value = {
            title: '',
            artist: '',
            id: `${Math.round(Math.random() * 10**13)}`,
            album: '',
            genres: [],
        };
    }
}, { immediate: true });

onMounted(() => {
    getGenres().then((data) => {
        availableGenres.value = data.map((genre) => ({
            label: genre[0].toUpperCase() + genre.slice(1),
            value: genre,
        }));
    }).catch((err) => {
        console.error('Error fetching genres:', err);
        error.value = 'Failed to fetch genres';
    });
})

</script>