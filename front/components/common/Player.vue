<template>
  <div class="audio-player">
    <div class="player-info">
      <div v-if="props.track" class="track-info">
        <h3>{{ props.track.title || 'Unknown Track' }}</h3>
        <p>{{ props.track.artist || 'Unknown Artist' }}</p>
      </div>
      <div v-else class="track-info">
        <h3>No track selected</h3>
      </div>
    </div>
    
    <div class="progress-container">
      <div class="progress-bar">
        <div class="progress" :style="{ width: `${progress}%` }"/>
      </div>
      <div class="time-info">
        <span>{{ formatTime(currentTime) }}</span>
        <span>{{ formatTime(duration) }}</span>
      </div>
    </div>
    
    <div class="controls">
      <button class="control-button main" @click="isPlaying ? pauseTrack() : playTrack()">
        <span class="material-symbols-outlined" >{{isPlaying ? 'pause' : 'play_arrow'}}<span/>
      </span></button>
      <button class="control-button" @click="stopTrack">
        <span class="material-symbols-outlined">stop</span>
      </button>
      <div class="volume-control">
        <span class="material-symbols-outlined">volume_up</span>
        <input 
          v-model="volume" 
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          @input="setVolume(volume)"
        >
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Howl, Howler } from 'howler';

const props = defineProps({
  track: {
    type: Object,
    default: () => null,
  },
  src: {
    type: String,
    default: '',
  },
});

const isPlaying = ref(false);
const volume = ref(0.7);
const currentTime = ref(0);
const duration = ref(0);
const progress = computed(() => {
  return duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0;
});

// Create a sound instance with the first track
let sound: Howl | null = null;

// Initialize the sound object
const initSound = () => {
  // If sound exists, unload it first
  if (sound) {
    sound.unload();
  }
  
  sound = new Howl({
    src: [props.src],
    html5: true,
    volume: volume.value,
    onplay: () => { isPlaying.value = true; },
    onpause: () => { isPlaying.value = false; },
    onstop: () => { isPlaying.value = false; currentTime.value = 0; },                              
    onload: () => { duration.value = sound ? sound.duration() : 0; }
  });
};

// Track time update
const updateTime = () => {
  if (sound && isPlaying.value) {
    currentTime.value = sound.seek() || 0;
    requestAnimationFrame(updateTime);
  }
};

const playTrack = () => {
  if (!sound) {
    initSound();
  }
  if (sound) {
    sound.play();
    updateTime();
  }
};

const pauseTrack = () => {
  if (sound) {
    sound.pause();
  }
};

const stopTrack = () => {
  if (sound) {
    sound.stop();
  }
};

const setVolume = (vol: number) => {
  if (sound) {
    sound.volume(Number(vol));
  }
  Howler.volume(Number(vol));
};

// Format time in seconds to MM:SS
const formatTime = (secs: number): string => {
  secs = Math.floor(secs);
  const minutes = Math.floor(secs / 60) || 0;
  const seconds = Math.floor(secs % 60) || 0;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

onMounted(() => {
  initSound();
});

onBeforeUnmount(() => {
  if (sound) {
    sound.unload();
  }
});
</script>

<style scoped>
.audio-player {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background: #f7f7f7;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.player-info {
  margin-bottom: 15px;
  text-align: center;
}

.track-info h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.track-info p {
  margin: 5px 0 0;
  font-size: 14px;
  color: #666;
}

.progress-container {
  margin-bottom: 20px;
}

.progress-bar {
  height: 6px;
  background: #ddd;
  border-radius: 3px;
  position: relative;
  margin-bottom: 5px;
}

.progress {
  height: 100%;
  background: #4CAF50;
  border-radius: 3px;
}

.time-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
}

.controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.control-button {
  background: none;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: #e6e6e6;
  transition: all 0.2s;
}

.control-button:hover {
  background: #d9d9d9;
}

.control-button.main {
  width: 50px;
  height: 50px;
  background: #4CAF50;
  color: white;
}

.control-button.main:hover {
  background: #3e8e41;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.volume-control input {
  width: 80px;
}

/* For smaller screens */
@media (max-width: 500px) {
  .controls {
    flex-wrap: wrap;
  }
  
  .volume-control {
    width: 100%;
    margin-top: 10px;
    justify-content: center;
  }
}
</style>