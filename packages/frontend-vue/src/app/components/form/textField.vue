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
            >
        </label>
        <div
            v-if="type === 'otp'"
            :class="['flex gap-3 justify-between', layoutClass]"
        >
            <input
                v-for="(i, index) in length"
                :key="i"
                ref="otpInputs"
                :name="name + i"
                :data-testid="name + i"
                :type="type"
                :disabled="disabled"
                :placeholder="placeHolder"
                :class="[
                    'text-md w-full rounded-xl outline-none bg-transparent',
                    size,
                    disabled
                        ? 'bg-gray-400 text-gray-400 dark:text-gray-300'
                        : '',
                ]"
                maxlength="1"
                @input="handleInputChange($event, index)"
                @keydown="handleKeyDown($event, index)"
            />
        </div>
        <div
            v-else
            :class="[
                'flex text-md border border-gray-300 hover:border-gray-500 text-md w-full rounded-xl relative items-center gap-1 transition-border duration-300',
                layoutClass,
                disabled ? 'bg-gray-200 text-gray-400 dark:text-gray-300' : '',
            ]"
        >
            <slot name="startIcon" />
            <SvgIcon
                v-if="['date', 'datetime-local'].includes(type)"
                path="/images/svg/calendar.svg"
                class="!w-6 !h-6 m-auto ml-2 !text-gray-400"
            ></SvgIcon>
            <SvgIcon
                v-if="type === 'time'"
                path="/images/svg/time.svg"
                class="!w-6 !h-6 m-auto ml-2 !text-gray-400"
            ></SvgIcon>
            <textarea
                v-if="type === 'textarea'"
                v-model="handleInput"
                :data-testid="name"
                :name="name"
                :placeholder="placeHolder"
                :disabled="disabled"
                :min="min"
                :multiple="true"
                :rows="rows"
                :class="['w-full rounded-xl outline-none bg-transparent', size]"
                style="resize: none"
            />
            <input
                v-else
                v-model="handleInput"
                :data-testid="name"
                :name="name"
                :type="
                    ['autocomplete', 'select'].includes(type)
                        ? 'text'
                        : show
                          ? 'text'
                          : type
                "
                :placeholder="placeHolder"
                :disabled="disabled || type === 'select'"
                :min="min"
                :format="format"
                :class="[
                    'text-md w-full rounded-xl outline-none bg-transparent',
                    size,
                ]"
                autocomplete="off"
                :value="
                    ['autocomplete', 'select'].includes(type)
                        ? options.find((o) => o.id === value)?.label
                        : value
                "
                @input="limitInput($event)"
                @keypress="filterNumericInput"
                @paste="filterPaste"
                @focus="focus"
                @blur="blur"
                @click="toggleMenu()"
            />
            <div
                v-if="type === 'select'"
                :data-testid="`${name}-select`"
                class="absolute top-0 left-0 w-full h-full"
                @click="toggleMenu()"
            ></div>
            <button
                v-if="type === 'password'"
                type="button"
                class="mr-3"
                oncontextmenu="return false;"
                @click="toggle()"
            >
                <SvgIcon
                    v-if="show"
                    path="/images/svg/visibility.svg"
                    class="!h-5 !w-5 !text-current"
                ></SvgIcon>
                <SvgIcon
                    v-else
                    path="/images/svg/visibility_off.svg"
                    class="!h-5 !w-5 !text-current"
                ></SvgIcon>
            </button>
            <button
                v-if="['autocomplete', 'select'].includes(type)"
                type="button"
                class="mr-3"
                oncontextmenu="return false;"
                @click="toggleMenu()"
            >
                <SvgIcon
                    path="/images/svg/arrow.svg"
                    :class="[
                        '!h-3 !w-3 !text-current transition-transform duration-300',
                        showMenu ? '' : 'rotate-180',
                    ]"
                ></SvgIcon>
            </button>
            <slot name="endIcon" />
            <ul
                v-if="['autocomplete', 'select'].includes(type)"
                v-show="showMenu"
                :data-testid="`${name}-menu`"
                class="absolute bg-white dark:bg-black border border-gray-300 shadow-[0_0_5px_#00000050] dark:shadow-[#ffffff] rounded-lg w-full max-h-32 h-fit overflow-auto z-10 top-[100%] max-md:fixed max-md:left-[50%] max-md:top-[50%] max-md:-translate-x-[50%] max-md:-translate-y-[50%] max-md:max-w-sm max-sm:w-[90%]"
            >
                <li
                    v-for="(option, index) in filterOptions"
                    :key="index"
                    :data-testid="option"
                    class="app-button !border-none !rounded-none !justify-start !w-full capitalize"
                    @click="selectOption(option.id)"
                >
                    {{ option.label }}
                </li>
                <li
                    v-if="filterOptions.length === 0"
                    class="app-button !border-none !rounded-none !justify-start !w-full"
                    @click="selectOption('')"
                >
                    No options found
                </li>
            </ul>
        </div>

        <p
            v-show="!noError"
            :data-testid="`${name}-error`"
            :class="[
                'mt-1 text-xs italic min-h-4',
                error ? 'text-red-500' : 'text-gray-400',
            ]"
        >
            <span
                v-if="type === 'tag'"
                :data-testid="`${name}-error`"
                class="mt-1 text-xs italic min-h-4 text-gray-400"
            >
                separated by commas, semicolons, or newlines </span
            ><br v-if="type === 'tag'" />
            {{ error || helperText }}
        </p>
        <div
            v-if="type === 'tag'"
            class="block max-h-20 overflow-y-auto no-scrollbar"
        >
            <p
                v-for="tag in getTagValues(handleInput as string)"
                :key="tag"
                class="text-xs rounded-full border border-gray-300 w-fit px-2 pb-0.5 m-0.5 truncate max-w-[250px] float-left"
            >
                {{ tag }}
            </p>
        </div>
    </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';

//
import { getTagValues } from 'services/constants';

//
import SvgIcon from '../svg.vue';

//
export default {
    name: 'TextField',
    components: { SvgIcon },
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
        value: {
            default: '',
            type: [String, Number],
        },
        error: {
            default: '',
            type: String,
        },
        noError: {
            default: false,
            type: Boolean,
        },
        disabled: {
            default: false,
            type: Boolean,
        },
        type: {
            default: 'text',
            type: String as PropType<IFieldType>,
        },
        min: {
            default: '',
            type: String,
        },
        max: {
            default: '',
            type: String,
        },
        size: {
            default: 'p-3 text-md',
            type: String,
        },
        rows: {
            default: '',
            type: String,
        },
        required: {
            default: false,
            type: Boolean,
        },
        layoutClass: {
            default: '',
            type: String,
        },
        format: {
            default: '',
            type: String,
        },
        options: {
            default: () => [],
            type: Array as PropType<{ id: string; label: string }[]>,
        },
        length: {
            default: 4,
            type: Number,
        },
    },
    emits: ['onchange'],
    data() {
        return {
            handleInput: this.value,
            show:
                ['date', 'datetime-local', 'time'].includes(this.type) || false,
            showMenu: false,
            otp: [] as string[],
            getTagValues,
        };
    },
    computed: {
        filterOptions() {
            return this.type === 'select'
                ? this.options
                : this.options?.filter((option) =>
                      `${option.id} ${option.label}`
                          .toLowerCase()
                          .includes(`${this.handleInput}`.toLowerCase())
                  ) || [];
        },
    },
    watch: {
        handleInput(value) {
            if (this.type !== 'autocomplete') {
                this.$emit('onchange', {
                    name: this.name,
                    value,
                });
            } else if (this.type === 'autocomplete' && !value) {
                this.$emit('onchange', { name: this.name, value });
            }
        },
        value(propsValue) {
            this.handleInput = propsValue;
        },
    },
    beforeUnmount() {
        document.removeEventListener('click', this.handleOutsideClick);
    },
    methods: {
        toggle() {
            this.show = !this.show;
        },
        toggleMenu() {
            if (['autocomplete', 'select'].includes(this.type)) {
                this.showMenu = !this.showMenu;
                if (this.showMenu)
                    setTimeout(() => {
                        document.removeEventListener(
                            'click',
                            this.handleOutsideClick
                        );
                        document.addEventListener(
                            'click',
                            this.handleOutsideClick
                        );
                    }, 100);
                else
                    document.removeEventListener(
                        'click',
                        this.handleOutsideClick
                    );
            }
        },
        limitInput(event: Event) {
            const target = event.target as HTMLInputElement;
            if (this.type === 'number' && target.value.length >= 19) {
                target.value = target.value.slice(0, 19);
                this.handleInput = target.value;
            }
        },
        filterNumericInput(event: KeyboardEvent) {
            if (this.type === 'number') {
                const char = String.fromCharCode(event.keyCode);
                if (
                    !/[0-9]/.test(char) &&
                    ![8, 9, 13, 37, 39].includes(event.keyCode)
                ) {
                    event.preventDefault();
                }
            }
        },
        filterPaste(event: ClipboardEvent) {
            if (this.type === 'number') {
                const pasteData = event.clipboardData?.getData('text');
                if (pasteData && !/^\d+$/.test(pasteData)) {
                    event.preventDefault();
                }
            }
        },
        focus() {
            if (['date', 'datetime-local', 'time'].includes(this.type))
                this.show = false;
        },
        blur() {
            if (['date', 'datetime-local', 'time'].includes(this.type))
                this.show = true;
        },
        selectOption(value: string) {
            this.$emit('onchange', { name: this.name, value });
            this.showMenu = false;
            document.removeEventListener('click', this.handleOutsideClick);
        },
        handleOutsideClick() {
            if (this.showMenu) {
                this.showMenu = false;
                this.handleInput = this.value;
                document.removeEventListener('click', this.handleOutsideClick);
            }
        },

        // OTP
        handleInputChange(event: Event, index: number) {
            const target = event.target as unknown as { value: string };
            const otpInputs = this.$refs.otpInputs as HTMLInputElement[];
            if (/^\d$/.test(target.value)) {
                this.otp[index] = target.value;
                this.$emit('onchange', {
                    name: this.name,
                    value: Object.values(this.otp).join(''),
                });
                if (
                    (event as unknown as { inputType: string }).inputType ===
                        'deleteContentBackward' &&
                    index > 0
                ) {
                    this.otp[index] = '';
                    const previousInput = otpInputs[index - 1];
                    if (previousInput) {
                        previousInput.focus();
                    }
                } else if (index < otpInputs.length - 1) {
                    const nextInput = otpInputs[index + 1];
                    if (nextInput) {
                        nextInput.focus();
                    }
                }
            } else if (
                (event as unknown as { key: string }).key === 'Backspace' &&
                index > 0
            ) {
                this.otp[index] = '';
                const previousInput = otpInputs[index - 1];
                if (previousInput) {
                    previousInput.focus();
                }
            } else {
                (event.target as unknown as { value: string }).value = '';
            }
        },
        handleKeyDown(event: KeyboardEvent, index: number) {
            const otpInputs = this.$refs.otpInputs as HTMLInputElement[];
            if (
                index > 0 &&
                event.key === 'Backspace' &&
                !otpInputs[index].value
            ) {
                this.$nextTick(() => {
                    const previousInput = otpInputs[index - 1];
                    if (previousInput) {
                        previousInput.focus();
                    }
                });
            }
        },
    },
};

export type IFieldType =
    | 'text'
    | 'textarea'
    | 'number'
    | 'date'
    | 'time'
    | 'datetime-local'
    | 'password'
    | 'tag'
    | 'autocomplete'
    | 'select'
    | 'otp';
</script>
