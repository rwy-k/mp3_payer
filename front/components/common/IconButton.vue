<template>
    <button 
        class="material-symbols-outlined cursor-pointer rounded-4xl p-1" 
        :class="{ 'text-gray-300 !cursor-default': props.disabled, 'hover:bg-blue-100': !props.disabled }" 
        @click="emit('click')"
    >
        <slot />
    </button>
</template>

<script setup lang="ts">
const props = defineProps({
    disabled: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['click']);

</script>