import { defineStore } from 'pinia';
import type { Track } from '@/types/tracks';

interface TracksState {
  tracks: Track[];
  currentTrack: Track | null; 
  isPlaying: boolean;
  error: string | null;
}

// Create and export the tracks store
export const useTracksStore = defineStore('tracks', {
  state: (): TracksState => {
    return {
      tracks: [],
      currentTrack: null,
      isPlaying: false,
      error: null,
    };
  },
  
  getters: {
    getTracks: (state) => state.tracks,
    getCurrentTrack: (state) => state.currentTrack,
    getError: (state) => state.error,
    getIsPlaying: (state) => state.isPlaying,
  },
  
  actions: {
    setCurrentTrack(track: Track | null) {
        this.currentTrack = track;
    },

    playTrack() {
        this.isPlaying = true;
    },
    togglePlay() {
      this.isPlaying = !this.isPlaying;
    },
    pauseTrack() {
        this.isPlaying = false;
    },
    stopTrack() {
      this.currentTrack = null;
    },

    setError(error: string | null) {
        this.error = error;
    },

    addTrack(track: Track) {
        this.tracks.push(track);
    },

    setTracks(tracks: Track[]) {
        this.tracks = tracks;
    },

    deleteTrack(trackId: string) {
        this.tracks = this.tracks.filter((track) => track.id !== trackId);
    },

    updateTrack(trackId: string, updatedTrack: Partial<Track>) {
        const trackIndex = this.tracks.findIndex((track) => track.id === trackId);
        if (trackIndex !== -1) {
            this.tracks[trackIndex] = { ...this.tracks[trackIndex], ...updatedTrack };
        }
    },

  },
  persist: true,
});
