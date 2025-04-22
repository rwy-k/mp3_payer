<template>
    <div class="flex flex-col gap-4 w-full h-full">
        <div class="flex items-end">
            <h1 class="mx-auto text-4xl mt-8">Music Tracks</h1>
            <div class="flex gap-2 h-9 mb-1 mr-8">
                <!-- <Button @click="fetchTracks">Refresh</Button> -->
                <Button @click="showAddTrackModal = true">Create</Button>
                <Button :disabled="!selectedTracks.length" @click="showDeleteTrackModal = true">Delete</Button>
            </div>
        </div>
        <div class="flex justify-between px-3">
            <div class="items-center flex gap-2">
                <IconButton :disabled="currentPage === 1" @click="handlePageChange(currentPage - 1)">arrow_back</IconButton>
                <b>{{ currentPage }}</b> / {{ maxPageNumber }}
                <IconButton :disabled="currentPage === maxPageNumber" @click="handlePageChange(currentPage + 1)">arrow_forward</IconButton>
            </div>
            <div class="flex gap-2">
                <USwitch v-model="sortSettings.order"></USwitch>
                <Menu v-model="sortSettings.field" label="Sort by" :options="sortFields"/>
            </div>
        </div>

        <TracksList
            v-if="tracks.length"
            v-model="selectedTracks"
            :tracks="currentPageTracks"
            @edit="track => { selectedTrack = track; showEditTrackModal = true}"
            @delete="track => { selectedTrack = track; showDeleteTrackModal = true; }"
            @upload="track => { selectedTrack = track; showUploadTrackModal = true; }"
        />
        <Alert v-else :type="AlertType.INFO">No tracks available.</Alert>
        <Alert v-if="error" :type="AlertType.ERROR">{{ error }}</Alert>
        <Alert v-if="loading" :type="AlertType.INFO">Loading tracks...</Alert>

        <ModifyTrackModal
            v-if="showAddTrackModal || showEditTrackModal"
            :track-to-edit="showEditTrackModal ? selectedTrack : null"
            @close="showAddTrackModal = false; showEditTrackModal = false"
            @refresh="fetchTracks"
        />
        <DeleteTrackModal
            v-if="showDeleteTrackModal"
            :tracks="selectedTrack ? [selectedTrack] : selectedTracks"
            @close="showDeleteTrackModal = false"
            @refresh="fetchTracks"
        />
        <UploadMusicModal
            v-if="showUploadTrackModal && selectedTrack"
            :track="selectedTrack!"
            @close="showUploadTrackModal = false"
            @refresh="fetchTracks"
        />
    </div>
</template>
<script setup lang="ts">
import { getAllTracks } from '../api/tracks';
import { SortOptions, type Track } from '~/types/tracks';
import { sortFields, filterFields } from './constants';
import { Button, ModifyTrackModal, TracksList } from '~/components';
import Alert from '~/components/common/Alert.vue';
import { AlertType, type Option } from '~/types/components';
import DeleteTrackModal from '~/components/DeleteTrackModal.vue';
import UploadMusicModal from '~/components/UploadMusicModal.vue';
import IconButton from '~/components/common/IconButton.vue';
import Menu from '~/components/common/Menu.vue';
import sortBy from 'lodash/sortBy';
import { USwitch } from '#components';

const loading = ref(false);
const error = ref<string | null>(null);

const showAddTrackModal = ref(false);
const showEditTrackModal = ref(false);
const showDeleteTrackModal = ref(false);
const showUploadTrackModal = ref(false);

const currentPage = ref(1);
const itemsPerPage = ref(10);

const sortSettings = reactive({
    order: ref(SortOptions.DESC),
    field: ref<Option|null>(null)
})
const filterOptions = reactive({
    artist: [],
    genres: []
})

const tracks = ref<Track[]>([]);
const selectedTrack = ref<Track | null>(null);
const selectedTracks = ref<Track[]>([]);

const maxPageNumber = computed(() => {
    return Math.ceil(tracks.value.length / itemsPerPage.value) || 1; // can't be zero pages
});
const currentPageTracks = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return sortedTracks.value.slice(start, end);
});
const sortedTracks = computed(() => {
    if (!sortSettings.field) return tracks.value;
    else return sortBy(tracks.value, sortSettings.field.value);
})

const handlePageChange = (page: number) => {
    if (page < 1 || page > maxPageNumber.value) return;
    currentPage.value = page;
    selectedTrack.value = null; // Reset selected track when changing pages
};
const fetchTracks = async () => {
    loading.value = true;
    error.value = null;

    try {
        const data = await getAllTracks();
        if (!data) {
            throw new Error('No data found');
        }
        
        tracks.value = data;
    } catch (err: unknown) {
        console.error('Error fetching tracks:', err);
        error.value = 'Failed to fetch tracks';
    } finally {
        loading.value = false;
        selectedTrack.value = null; // Reset selected track after fetching
    }
};

onMounted(() => {
    fetchTracks();
});
</script>
