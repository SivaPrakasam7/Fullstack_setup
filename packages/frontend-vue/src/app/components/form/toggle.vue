<template>
    <div :class="['w-full', layoutClass]">
        <label
            v-if="label"
            :for="name"
            class="block mb-1 text-sm font-bold text-gray-600 dark:text-white"
            >{{ label
            }}<span
                v-show="label && required"
                class="text-red-400 font-bold text-xs"
                >*</span
            ></label
        >
        <label class="relative inline-flex items-center cursor-pointer">
            <input
                type="checkbox"
                :name="name"
                :data-testid="name"
                :disabled="disabled"
                :checked="value"
                class="sr-only peer"
                @change="handleInput"
            />
            <div
                class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
            />
        </label>
        <p
            :data-testid="`${name}-error`"
            :class="[
                'mt-1 text-xs italic min-h-4',
                error ? 'text-red-500' : 'text-gray-400',
            ]"
        >
            {{ error || helperText }}
        </p>
    </div>
</template>

<script lang="ts">
export default {
    name: 'ToggleView',
    props: {
        name: {
            required: true,
            type: String,
        },
        label: {
            default: '',
            type: String,
        },
        helperText: {
            default: '',
            type: String,
        },
        value: {
            type: Boolean,
            default: false,
        },
        error: {
            default: '',
            type: String,
        },
        disabled: {
            default: false,
            type: Boolean,
        },
        required: {
            default: false,
            type: Boolean,
        },
        layoutClass: {
            default: '',
            type: String,
        },
    },
    emits: ['onchange'],
    methods: {
        handleInput() {
            this.$emit('onchange', {
                name: this.name,
                value: !this.value,
            });
        },
    },
};
</script>
