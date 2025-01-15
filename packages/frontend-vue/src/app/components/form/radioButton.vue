<template>
    <div class="w-full">
        <label
            v-if="label"
            :for="name"
            class="block mb-1 text-sm font-bold text-gray-600 dark:text-white"
            >{{ label }}</label
        >
        <div :class="['flex flex-wrap gap-3 mt-2', layoutClass]">
            <div
                v-for="(option, index) in options"
                :key="option"
                class="flex flex-row items-center"
            >
                <input
                    type="radio"
                    :name="name"
                    :data-testid="name"
                    :value="option"
                    :checked="value?.includes(option)"
                    class="text-left mr-2"
                    @change="handleInput(option)"
                />
                <!--  eslint-disable-next-line vue/no-v-html -->
                <span class="text-sm md:whitespace-nowrap" v-html="option" />
                <input
                    v-if="customField && index === options.length - 1"
                    type="text"
                    class="outline-none border-b-[1px] bg-blue-500 w-full"
                    :disabled="!value?.includes(option)"
                    @change="
                        (e) => {
                            value?.includes(option) &&
                                handleCustomField(e, option);
                        }
                    "
                />
            </div>
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
    name: 'RadioButton',
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
        customField: {
            default: false,
            type: Boolean,
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
        handleCustomField(e: Event, option: string) {
            const v = (e.target as unknown as { value: string }).value;
            this.handleInput(`${option} ${v}`);
        },
    },
};
</script>
