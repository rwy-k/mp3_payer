<template>
    <div class="p-4 rounded-md shadow-md flex items-center gap-2" :class="[styles[props.type], 'w-full']">
        <span class="material-symbols-outlined">{{ props.icon }}</span>
        <slot />
        <span
            v-if="props.close"
            class="material-symbols-outlined cursor-pointer"
            @click="emit('close')"
        >close</span>
    </div>
</template>
<script setup lang="ts">
import { AlertType, type IconType } from '@/types/components';

const props = defineProps({
    icon: {
        type: String as () => IconType | '',
        default: '',
    },
    type: {
        type: String as () => AlertType,
        default: AlertType.INFO,
    },
    close: {
        type: Boolean,
        default: false,
    },
});

const styles = {
    [AlertType.INFO]: 'bg-blue-100 text-blue-800',
    [AlertType.SUCCESS]: 'bg-green-100 text-green-800',
    [AlertType.WARNING]: 'bg-yellow-100 text-yellow-800',
    [AlertType.ERROR]: 'bg-red-100 text-red-800',
};

const emit = defineEmits(['close']);
</script>