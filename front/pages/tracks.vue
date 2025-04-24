<template>
    <div class="flex flex-col gap-4 w-full h-full">
        <div class="flex items-end">
            <h1 class="ml-8 mr-auto text-4xl mt-8" data-testid="tracks-header">Music Tracks</h1>
            <div class="flex gap-2 h-9 mb-1 mr-8">
                <!-- <Button @click="fetchTracks">Refresh</Button> -->
                <Button data-testid="create-track-button" @click="showAddTrackModal = true">Create</Button>
                <Button :disabled="!selectedTracks.length" @click="showDeleteTrackModal = true">Delete</Button>
            </div>
        </div>
        <div class="flex items-center p-3 border-b border-t border-blue-950">
            <div class="items-center flex gap-2" data-testid="pagination">
                <IconButton :disabled="currentPage === 1" data-testid="pagination-prev" @click="handlePageChange(currentPage - 1)">arrow_back</IconButton>
                <b>{{ currentPage }}</b> / {{ maxPageNumber }}
                <IconButton :disabled="currentPage === maxPageNumber" data-testid="pagination-next" @click="handlePageChange(currentPage + 1)">arrow_forward</IconButton>
            </div>
            <div class="flex items-center gap-2 ml-8">
                <input
                    v-model="searchQuery"
                    data-testid="search-input"
                    type="text"
                    placeholder="Search by title, artist, or album"
                    class="border border-blue-950 rounded px-2 py-1 w-64"
                    @input="debouncedSearch = searchQuery"
                >
                <span class="material-symbols-outlined text-blue-950">search</span>
            </div>
            <Menu v-model="sortSettings" data-testid="sort-select" class="flex gap-2 ml-auto" label="Sort by" :options="sortFields"/>
        </div>
        <div class="flex items-center gap-2 pb-3 px-3 mx-auto w-full border-b border-blue-950">
            <Dropdown 
                v-model="filterSettings.artist"
                :options="filterFields.artist"
                placeholder="Filter by artist"
                data-testid="filter-artist"
            />
            <Dropdown 
                v-model="filterSettings.genres"
                :options="filterFields.genres"
                placeholder="Filter by genre"
                data-testid="filter-genre"
            />
        </div>

        <TracksList
            v-if="tracks.length"
            v-model="selectedTracks"
            :tracks="currentPageTracks"
            class="mb-4"
            @edit="track => { selectedTrack = track; showEditTrackModal = true}"
            @delete="track => { selectedTrack = track; showDeleteTrackModal = true; }"
            @upload="track => { selectedTrack = track; showUploadTrackModal = true; }"
        />
        <Alert v-else :type="AlertType.INFO">No tracks available.</Alert>
        
        <InlinePlayer
            v-if="trackToPlay && trackToPlay.audioFile"
            class="mb-4"
        />
        
        <Alert v-if="error" :type="AlertType.ERROR">{{ error }}</Alert>
        <Alert v-if="loading" :type="AlertType.INFO" data-testid="loading-tracks" data-loading="true">Loading tracks...</Alert>


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
import type { Track } from '@/types/tracks';
import { sortFields } from './constants';
import { Button, ModifyTrackModal, TracksList, IconButton, Dropdown, InlinePlayer, DeleteTrackModal, UploadMusicModal, Menu } from '@/components';
import Alert from '@/components/common/Alert.vue';
import { AlertType, type Option } from '@/types/components';
import sortBy from 'lodash/sortBy';
import { getGenres } from '@/api/genres';
import { useTracksStore } from '#imports';

const store = useTracksStore();

const loading = ref(false);
const error = ref<string | null>(null);

const showAddTrackModal = ref(false);
const showEditTrackModal = ref(false);
const showDeleteTrackModal = ref(false);
const showUploadTrackModal = ref(false);

const currentPage = ref(1);
const itemsPerPage = ref(5);

const sortSettings = ref<Option|null>(null);

const searchQuery = ref('');
const debouncedSearch = ref('');

const filterSettings = reactive({
    artist: ref<Option[]>([]),
    genres: ref<Option[]>([]),
});
const filterFields = reactive({
    artist: ref<Option[]>([]),
    genres: ref<Option[]>([]),
});

const tracks = ref<Track[]>([]);
const selectedTrack = ref<Track | null>(null);
const selectedTracks = ref<Track[]>([]);
const trackToPlay = computed(() => {
    return store.currentTrack;
});

const maxPageNumber = computed(() => {
    return Math.ceil(tracks.value.length / itemsPerPage.value) || 1; // can't be zero pages
});
const currentPageTracks = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return filteredTracks.value.slice(start, end);
});
const sortedTracks = computed(() => {
    console.log('Sorting tracks by:', sortSettings.value?.value);
    if (!sortSettings.value) return tracks.value;
    else if (sortSettings.value.value === 'genres') {
        return sortBy(tracks.value, track => track.genres.sort().join(',').toLowerCase());
    }
    else return sortBy(tracks.value, sortSettings.value.value);
})
const searchTracks = computed(() => {
    if (!searchQuery.value) return sortedTracks.value;
    console.log('Searching tracks with query:', searchQuery.value);
    const query = searchQuery.value.toLowerCase();
    return sortedTracks.value.filter(track => {
        console.log('Checking track:', track);
        return (
            track.title && track.title.toLowerCase().includes(query) ||
            track.artist && track.artist.toLowerCase().includes(query) ||
            track.album && track.album.toLowerCase().includes(query)
        );
    });
});
const filteredTracks = computed(() => {
    const filteredByArtist = filterSettings.artist.length
        ? searchTracks.value.filter(track => filterSettings.artist.some(artist => track.artist === artist.value))
        : searchTracks.value;

    const filteredByGenres = filterSettings.genres.length
        ? filteredByArtist.filter(track => filterSettings.genres.some(genre => track.genres.includes(genre.value)))
        : filteredByArtist;

    return filteredByGenres;
});

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

        filterFields.artist = data.map(track => ({
            label: track.artist,
            value: track.artist,
        }));
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
    getGenres().then((data) => {
        filterFields.genres = data.map((genre) => ({
            label: genre[0].toUpperCase() + genre.slice(1),
            value: genre,
        }));
    }).catch((err) => {
        console.error('Error fetching genres:', err);
        error.value = 'Failed to fetch genres';
    });
});
</script>
