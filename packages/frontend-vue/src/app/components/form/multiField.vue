<template>
    <div class="w-full">
        <label
            v-if="label"
            :for="name"
            class="text-sm font-bold text-gray-600 dark:text-white"
            >{{ label
            }}<span v-show="label && required" class="text-red-500 font-bold"
                >*</span
            ></label
        >
        <div
            :class="[
                'overflow-y-auto overflow-x-hidden max-h-32 pr-2 w-full',
                layoutClass,
            ]"
        >
            <div
                v-for="(_, index) in textBoxes"
                :key="`${name}${index}`"
                class="flex items-center justify-center gap-0.5 w-full"
            >
                <TextField
                    :name="`${name}${index}`"
                    :value="form[`${name}${index}`]?.value"
                    :error="form[`${name}${index}`]?.error"
                    :disabled="disabled"
                    :place-holder="placeHolder"
                    class="mb-1"
                    :size="size"
                    @onchange="handleInput"
                >
                    <template #startIcon>
                        <slot name="startIcon" />
                    </template>
                    <template #endIcon> <slot name="endIcon" /> </template
                ></TextField>
                <button
                    v-if="
                        textBoxes.length > 1 && index === textBoxes.length - 1
                    "
                    type="button"
                    class="w-9 h-9 p-2 rounded-lg border border-gray-300 hover:border-gray-400 flex items-center justify-center mb-5"
                    data-testid="REMOVE_FIELD"
                    oncontextmenu="return false;"
                    @click="removeTextbox(index)"
                >
                    <i class="material-icons-rounded text-xl"
                        >remove_circle_outline</i
                    >
                </button>
            </div>
        </div>
        <div class="flex justify-start">
            <button
                data-testid="ADD_FIELD"
                type="button"
                :class="[
                    'w-fit  rounded-full border border-gray-400 hover:border-gray-500 hover:to-opacity-50 hover:from-opacity-18 flex flex-row justify-center items-center text-sm',
                    buttonSize || 'h-18 p-0.5 px-4',
                ]"
                oncontextmenu="return false;"
                @click="addTextbox()"
            >
                {{ buttonText }}
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';

//
import type { IFormField } from './form.types';

//
import TextField from './textField.vue';

//
export default {
    name: 'MultiField',
    components: { TextField },
    props: {
        name: {
            required: true,
            type: String,
        },
        label: {
            default: '',
            type: String,
        },
        placeHolder: {
            default: '',
            type: String,
        },
        helperText: {
            default: '',
            type: String,
        },
        form: {
            required: true,
            type: Object as PropType<Record<string, IFormField>>,
        },
        disabled: {
            default: false,
            type: Boolean,
        },
        size: {
            default: 'p-3 text-md',
            type: String,
        },
        buttonSize: {
            default: 'p-1.5 px-4 text-md',
            type: String,
        },
        buttonText: {
            default: '',
            type: String,
        },
        layoutClass: {
            default: '',
            type: String,
        },
        required: {
            default: false,
            type: Boolean,
        },
        remove: {
            type: Function as PropType<(index: number) => void>,
            required: true,
        },
        initialFieldCount: {
            type: Number,
            default: 1,
        },
    },
    emits: ['onchange'],
    data() {
        return {
            textBoxes: new Array(this.initialFieldCount).fill(''),
        };
    },
    mounted() {
        this.textBoxes = new Array(this.initialFieldCount).fill('');
        this.textBoxes.forEach((_, index) => {
            this.handleInput({
                ref: this.name,
                name: `${this.name}${index}`,
                value: this.form[`${this.name}${index}`]?.value || '',
                ignoreValidation: true,
            });
        });
    },
    methods: {
        handleInput(args: ILargeRecord) {
            this.$emit('onchange', { ...args, ref: this.name });
        },
        toFocus() {
            this.$nextTick(() => {
                const element = document.getElementById(
                    `${this.name}${this.textBoxes.length - 1}`
                );
                if (element) {
                    element.focus();
                    element.scrollIntoView({
                        block: 'center',
                        behavior: 'smooth',
                    });
                }
            });
        },
        addTextbox() {
            this.textBoxes.push('');
            this.handleInput({
                ref: this.name,
                name: `${this.name}${this.textBoxes.length - 1}`,
                value: '',
                ignoreValidation: true,
            });
            this.toFocus();
        },
        removeTextbox(index: number) {
            this.textBoxes.splice(index, 1);
            this.remove(index);
        },
    },
};
</script>
