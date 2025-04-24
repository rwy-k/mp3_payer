<template>
    <button
        class="bg-blue-950 text-white font-bold py-1 px-4 rounded cursor-pointer"
        :class="{
            'bg-blue-950': !props.loading,
            'bg-gray-400 !cursor-default': props.disabled,
        }"
        :disabled="props.disabled"
        :aria-disabled="props.disabled"
        :type="props.type as ButtonType"
        @click="emit('click')"
    >
        <slot></slot>
    </button>
</template>
<script setup lang="ts">
type ButtonType = 'button' | 'submit' | 'reset';

const props = defineProps({
    disabled: {
        type: Boolean,
        default: false,
    },
    loading: {
        type: Boolean,
        default: false,
    },
    type: {
        type: String,
        default: 'button',
    },
});
const emit = defineEmits(['click']);
</script>