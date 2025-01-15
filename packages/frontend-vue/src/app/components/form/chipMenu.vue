<template>
    <div class="w-full">
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
        <div class="flex flex-wrap gap-2 mt-2">
            <button
                v-for="option in options"
                :key="option"
                :name="option"
                :data-testid="option"
                type="button"
                :class="{
                    'text-gray-400 border-gray-300 hover:border-gray-500':
                        option !== value,
                    'border-green-500 text-green-500': option === value,
                }"
                class="rounded-full py-2 px-4 transition duration-300 ease-out border capitalize"
                oncontextmenu="return false;"
                @click="handleInput(option)"
            >
                {{ option }}
            </button>
        </div>
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
import type { PropType } from 'vue';

export default {
    name: 'ChipMenu',
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
            type: String,
            default: '',
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
        options: {
            required: true,
            type: Array as PropType<string[]>,
        },
    },
    emits: ['onchange'],
    methods: {
        handleInput(value: string) {
            this.$emit('onchange', {
                name: this.name,
                value: value === this.value ? undefined : value,
            });
        },
    },
};
</script>
