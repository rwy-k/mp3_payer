<template>
       <div class="modal">
        <div class="modal-content">
            <div class="flex justify-between items-center text-2xl mb-4">
                <h2>{{ props.label }}</h2>
                <span class="cursor-pointer" @click="emit('close')">&times;</span>
            </div>
            <slot />
        </div>
        <div class="modal-overlay" @click="emit('close')"/>
    </div>
</template>
<script setup lang="ts">    
const props = defineProps({
    label: {
        type: String,
        default: 'Modal',
    },
});
const emit = defineEmits(['close']);
</script>

<style scoped lang="scss">
    .modal {
        display: flex;
        justify-content: center;
        align-items: center;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 1000;
    }
    .modal-content {
        background-color: white;
        padding: 20px;
        border-radius: 5px;
        position: relative;
        z-index: 1001;
        width: 80%;
        max-width: 500px;
    }
    .modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 1000;
    }
    .hidden {
        display: none;
    }
</style>