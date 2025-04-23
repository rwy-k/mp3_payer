<template>

    <Modal label="Upload music" @close="emit('close')">
        <div v-if="!selectedFile" class="drag-file cursor-pointer p-5 mb-4 flex flex-col items-center justify-center w-full h-full border-dashed border-2 border-blue-200 rounded-xl hover:bg-blue-100" @click="uploadFile">
            <div class="text-center text-lg flex flex-col items-center gap-0.5">
                <p>Drag and drop your music files here</p>
                <p>or</p>
                <p>Click to select files</p>
            </div>
            <input ref="uploadFileRef" class="hidden" type="file" accept="audio/*" @change="handleFileUpload" >
        </div>
        <div v-else class="w-full h-full mb-4">
            <p class="flex items-center justify-between w-full mb-2 px-4">
                <span>Selected file: <b>{{ selectedFile.name }}</b></span>
                <IconButton @click="selectedFile = null">delete</IconButton>
            </p>
            <div v-if="fileUrl" class="relative w-full bg-[#f0f4f8]"> 
                <canvas ref="visualizerCanvas" class="w-full h-20 mt-2 rounded" style="background-color: #f0f4f8;"/>
                <audio  ref="audioElement" :src="fileUrl" controls class="w-full" @play="initializeAudioVisualization" @pause="stopAudioVisualization"/>
            </div>
        </div>
        <Button v-if="!loading" :disabled="saveBtnDisabled" class="mt-4 w-full" @click="saveMusic">Save</Button>

        <Alert v-else-if="error" :type="AlertType.ERROR">{{ error }}</Alert>
        <Alert v-else-if="success" :type="AlertType.SUCCESS">Music {{selectedFile ? 'uploaded' : 'deleted'}} successfully!</Alert>
        <Alert v-else-if="loading" :type="AlertType.INFO">Uploading music...</Alert>
    </Modal>
</template>
<script setup lang="ts">
import Modal from './common/Modal.vue';
import Button from './common/Button.vue';
import Alert from './common/Alert.vue';
import IconButton from './common/IconButton.vue';
// import Player from './common/Player.vue';
import { AlertType } from '@/types/components';
import { deleteMusicFromTrack, uploadMusicToTrack } from '@/api/tracks';
import type { Track } from '@/types/tracks';

const uploadFileRef = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const fileUrl = ref<string>('');

const error = ref<string | null>(null);
const loading = ref(false);
const success = ref(false);

// Audio visualization refs
const audioElement = ref<HTMLAudioElement | null>(null);
const visualizerCanvas = ref<HTMLCanvasElement | null>(null);
let audioContext: AudioContext | null = null;
let audioSource: MediaElementAudioSourceNode | null = null;
let analyser: AnalyserNode | null = null;
let animationFrameId: number | null = null;

const initializeAudioVisualization = () => {
    if (!audioElement.value || !visualizerCanvas.value) return;
    
    // Create audio context if not exists
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioSource = audioContext.createMediaElementSource(audioElement.value);
        analyser = audioContext.createAnalyser();
        
        audioSource.connect(analyser);
        analyser.connect(audioContext.destination);
        
        analyser.fftSize = 256;
    }
    
    drawWaveform();
};

const stopAudioVisualization = () => {
    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
};

const drawWaveform = () => {
    if (!analyser || !visualizerCanvas.value) return;
    
    const canvas = visualizerCanvas.value;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
        animationFrameId = requestAnimationFrame(draw);
        
        analyser!.getByteFrequencyData(dataArray);
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw waveform
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * canvas.height;
            
            // Create gradient for bars
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(1, '#a2c2f3');
            gradient.addColorStop(0, '#2b7fff');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            
            x += barWidth + 1;
        }
    };
    
    draw();
};

onUnmounted(() => {
    stopAudioVisualization();
    
    if (audioSource) {
        audioSource.disconnect();
    }
    
    if (audioContext) {
        audioContext.close();
    }
});

const uploadFile = () => {
    if (uploadFileRef.value) {
        uploadFileRef.value.click();
    }
};

const props = defineProps({
    track: {
        type: Object as () => Track,
        required: true,
    },
});
const emit = defineEmits(['close', 'refresh']);

const saveBtnDisabled = computed(() => {
    return !selectedFile.value && !props.track.audioFile;
});
const handleFileUpload = (event: Event) => {
    const target = event.target as HTMLInputElement;

    const file = target.files?.[0];
    if (!file) {
        console.error('No file selected');
        return;
    }
    selectedFile.value = file;

    // Reset the input value to allow re-uploading the same file
    target.value = '';
    
    fileUrl.value = URL.createObjectURL(file);

    console.log('File URL:', fileUrl.value);
};
const saveMusic = async () => {
    loading.value = true;

    try {
        if (!selectedFile.value) {
            await deleteMusicFromTrack(props.track.id);
            console.log('Music deleted successfully');
        } else {
            const fileSizeInMB = selectedFile.value.size / (1024 * 1024);
            if (fileSizeInMB > 10) {
                error.value = 'File size exceeds 10 MB';
                return;
            }

            const fileExtension = selectedFile.value.name.split('.').pop();
            if (!['mp3', 'wav', 'ogg'].includes(fileExtension || '')) {
                error.value = 'Invalid file type. Only MP3, WAV, and OGG are allowed.';
                return;
            }
            await uploadMusicToTrack(props.track.id, selectedFile.value);
            
        }
        
        success.value = true;
        emit('refresh');
    } catch (err) {
        console.error('Error uploading music:', err);
        error.value = 'Failed to upload music. Please try again.';
    } finally {
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate a delay
        emit('close');

        error.value = null;
        success.value = false;
        loading.value = false;
    }
};

onMounted(() => {
    if (props.track.audioFile) {
        selectedFile.value = new File([], props.track.audioFile);
    }
});
</script>
<style scoped>
.drag-file {
  transition: all 0.2s ease;
}
</style>