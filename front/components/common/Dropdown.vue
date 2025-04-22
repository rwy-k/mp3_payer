<template>
    <div ref="dropdownRef" class="relative w-full p-0.5">
        <div v-if="props.label" class="block text-sm font-medium text-gray-700 mb-1">{{ props.label }}</div>
        <div class="flex justify-between items-center cursor-pointer  border-gray-300 rounded-md shadow-sm p-0.5 " @click="showDropdownBody = !showDropdownBody">
            <span v-if="!selectedOptions.length && placeholder" class="text-md text-gray-500 p-0.5">{{ placeholder }}</span>
            <div v-else-if="selectedOptions.length" class="flex gap-2">
                <div v-for="option in selectedOptions" :key="option.value" class="flex items-center gap-1 bg-blue-300 rounded-full px-2 py-0.5">
                    {{ option.label }}
                    <span class="material-symbols-outlined cursor-pointer" @click.stop="toggleOption(option)">remove</span>
                </div>
            </div>
            <span class="material-symbols-outlined cursor pointer">
                {{ showDropdownBody ? 'expand_more' : 'chevron_right' }}
            </span>
        </div>
        <div v-show="showDropdownBody" class="absolute top-15 left-auto bg-white shadow-lg rounded-md p-2 z-10 w-[99%] max-h-30 overflow-scroll">
            <div v-for="option in availableOptions" :key="option.value" class="flex justify-between items-center hover:bg-blue-100 p-2 rounded-xl cursor-pointer" @click.stop="toggleOption(option)">
                <span>{{ option.label }}</span>
                <span class="material-symbols-outlined">add</span>
            </div>
            <div v-if="!availableOptions.length">No options</div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { useOutsideClick } from '~/composables/useOutsideClick';
import type { Option } from '~/types/components';

const props = defineProps({
    modelValue: {
        type: Array as () => Array<Option>,
        default: () => [],
    },
    options: {
        type: Array as () => Array<Option>,
        default: () => [],
    },
    label: {
        type: String,
        default: '',
    },
    placeholder: {
        type: String,
        default: 'Select an option',
    },
});
const emit = defineEmits(['update:modelValue']);


const showDropdownBody = ref(false);
const dropdownRef = shallowRef<HTMLElement | null>(null);
const selectedOptions = computed({
    get: () => props.modelValue,
    set: (value) => {
        emit('update:modelValue', value);
    },
});
const availableOptions = computed(() => {
    return props.options.filter(option => !selectedOptions.value.find(item => item.value === option.value));
});
const isOptionAdded = (option: Option): boolean => {
    return !!selectedOptions.value.find(item => item.value === option.value);
};
const toggleOption = (option: Option) => {
    if (isOptionAdded(option)) {
        selectedOptions.value = selectedOptions.value.filter((item) => item.value !== option.value);
    } else {
        selectedOptions.value = [...selectedOptions.value, option];
    }
};

useOutsideClick(dropdownRef, () => showDropdownBody.value = false)
</script>