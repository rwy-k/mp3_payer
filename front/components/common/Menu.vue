<template>
    <div class="relative" ref="menuRef">
        <button class="flex items-center cursor-pointer" @click="showBody = !showBody">
            {{ props.label }}
            <span class="material-symbols-outlined" >{{ !showBody ? 'arrow_drop_down' : 'arrow_drop_up'}}</span>
        </button>
        <div v-show="showBody" class="absolute right-1 w-30 cursor-pointer bg-white shadow-lg rounded-md p-2 z-10 max-h-30 overflow-scroll">
            <div 
                v-for="option in props.options" 
                :key="option.value" 
                class="px-1 py-0.5 rounded-md"
                :class="{ 'bg-blue-200' : selectedOption?.value === option.value}"
                @click="selectedOption = option; showBody = false;"
            >
                {{ option.label }}
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup> 
import type {Option} from '@/types/components';
import { useOutsideClick } from '@/composables/useOutsideClick';
const props = defineProps({
    label: {
        type: String,
        default: ''
    },
    options: {
        type: Array as () => Option[],
        required: true,
    },
    modelValue: {
        type: Object as () => Option|null,
        default: () => null
    }
})
const emit = defineEmits(['update:modelValue'])

const showBody = ref(false);
const menuRef = shallowRef<HTMLElement|null>(null);

const selectedOption = computed({
    get() {
        return props.modelValue
    },
    set(value) {
        emit('update:modelValue', value)
    }
})
useOutsideClick(menuRef, () => showBody.value = false)
</script>