<template>
    <div class="w-full">
        <label v-if="label" :for="id" class="block text-sm font-medium text-gray-700 mb-1 p-0.5">
            {{ label }}
        </label>
        <input
            :id="id"
            v-model="inputValue"
            :placeholder="placeholder"
            class="p-1 block w-full border-blue-950 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            :class="{
                'border-red-500': error,
                'border-blue-950': !error,
                'bg-gray-100 cursor-not-allowed': props.disabled,
            }"
            :required="props.required"
            :disabled="props.disabled"
            :aria-disabled="props.disabled"
            @input="updateValue"
        >
        <p v-if="error" :data-testid="`error-${props.name}`" class="text-red-500 text-sm mt-1">{{ error }}</p>
    </div>
</template>
<script setup lang="ts">
import { v4 as uuid } from 'uuid';

const props = defineProps({
    label: {
        type: String,
        default: '',
    },
    name: {
        type: String,
        default: '',
    },
    placeholder: {
        type: String,
        default: 'Enter value',
    },
    modelValue: {
        type: String,
        default: '',
    },
    required: {
        type: Boolean,
        default: false,
    },
    error: {
        type: String,
        default: null,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
});
const emit = defineEmits(['update:modelValue']);

const id = `input-${uuid()}`;

const inputValue = ref(props.modelValue);

const updateValue = (event: Event) => {
    const target = event.target as HTMLInputElement;
    inputValue.value = target.value;
};

watch(() => props.modelValue, (newValue) => {
    inputValue.value = newValue;
});
watch(inputValue, (newValue) => {
    emit('update:modelValue', newValue);
});
</script>