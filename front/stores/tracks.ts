import { defineStore } from 'pinia';
import type { Track } from '@/types/tracks';

interface Upload {
    id: string;
    url: string;
}

// Define the store state interface
interface TracksState {
  uploads: Upload[];
  currentTrack: Track | null;
  error: string | null;
}

const loadState = (): Partial<TracksState> => {
    try {
      const savedState = localStorage.getItem('tracks-store');
      console.log('Loading state from localStorage:', savedState);
      return savedState ? JSON.parse(savedState) : {};
    } catch (e) {
      console.error('Error loading state:', e);
      return {};
    }
  };

// Create and export the tracks store
export const useTracksStore = defineStore('tracks', {
  state: (): TracksState => {
    return {
      uploads: [],
      currentTrack: null,
      error: null,
    };
  },
  
  getters: {
    getCurrentTrack: (state) => state.currentTrack,

    getUploads: (state) => state.uploads,

    getMusicToPlay: (state) =>  {
        if (state.currentTrack) {
            const musicToPlay = state.uploads.find(upload => upload.id === state.currentTrack!.id);
            return musicToPlay ? musicToPlay.url : null;
        }
        return null;
    }
  },
  
  actions: {
    setCurrentTrack(track: Track | null) {
        this.currentTrack = track;
    },

    addMusic(id: string, url: string) {
        this.uploads.push({ id, url });
    },
  },
  persist: true,
});
