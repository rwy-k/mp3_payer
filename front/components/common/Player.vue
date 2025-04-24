<template>
  <div class="relative w-full bg-[#f0f4f8]">
    <canvas ref="visualizerCanvas" class="w-full h-20 mt-2 rounded" style="background-color: #f0f4f8;"/>
    <audio  ref="audioElement" :src="props.file" controls class="w-full" @play="initializeAudioVisualization" @pause="stopAudioVisualization"/>
  </div>
</template>
<script setup lang="ts">
const props = defineProps({
    file: {
        type: String,
        required: true
    }
});

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
</script>