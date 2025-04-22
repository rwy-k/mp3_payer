<template>
    <div>
        <div class="flex justify-between items-center">
            <span>{{ label }}</span>
            <span
                class="icon-button material-symbols-outlined"
                @click="items.push('')"
            >add</span>
        </div>
        <div class="input-container w-full my-2">
            <div v-for="(item, index) in items" :key="index" class="flex gap-4 items-center">
                <InputField
                    v-model="items[index]"
                    :placeholder="placeholder"
                    class="w-full"
                />
                <span
                    class="icon-button material-symbols-outlined pl-2"
                    @click="items.splice(index, 1)"
                >remove</span>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import InputField from './InputField.vue';

const props = defineProps({
    label: {
        type: String,
        default: '',
    },
    placeholder: {
        type: String,
        default: 'Enter item',
    },
    modelValue: {
        type: Array,
        default: () => [],
    },
});
const emit = defineEmits(['update:modelValue']);

const items = reactive<string[]>(props.modelValue as string[]);

watch(items, (newItems) => {
    emit('update:modelValue', newItems);
});
</script>
<style scoped lang="scss">
.icon-button {
    cursor: pointer;
    font-size: 24px;
    color: #333;
    transition: color 0.3s;
    &:hover {
        color: #007bff;
    }
}
</style>