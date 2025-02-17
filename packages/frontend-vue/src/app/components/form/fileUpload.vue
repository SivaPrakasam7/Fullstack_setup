<template>
    <div class="w-full">
        <input
            :id="`${name}-browse`"
            :data-testid="name"
            :name="name"
            type="file"
            :accept="accept"
            :disabled="disabled"
            :multiple="multiple"
            hidden
            @change="loadFile"
        />
        <label
            v-if="label"
            :for="name"
            class="block mb-1 text-sm font-bold text-gray-600 dark:text-white"
            >{{ label
            }}<span
                v-show="label && required"
                class="text-red-500 font-bold text-xs"
                >*</span
            ></label
        >
        <div :class="['w-full grid grid-cols-2 gap-1 items-end', layoutClass]">
            <label
                :for="`${name}-browse`"
                :class="[
                    'flex flex-col gap-1 items-center justify-center rounded-lg border-gray-300 border border-dashed cursor-pointer',
                    size,
                    disabled
                        ? 'shadow-[_0px_0px_20px_inset] shadow-gray-400'
                        : isDragging
                          ? ' shadow-[_0px_0px_20px_inset] shadow-green-500'
                          : '',
                ]"
                @dragover.prevent="dragOver"
                @dragleave="dragLeave"
                @drop.prevent="onDrop"
            >
                <slot name="uploadIcon" />
                <p class="text-sm text-gray-400 text-center">
                    Drag & Drop<br /><span class="text-themeColorAlternate"
                        >or browse</span
                    >
                </p>
            </label>
            <div class="block">
                <div
                    v-for="(image, index) in files"
                    :key="index"
                    :data-title="image.name"
                    data-testid="SELECTED_FILE"
                    :class="[
                        'float-left m-1 relative border border-gray-300 rounded-lg',
                        imageSize,
                    ]"
                >
                    <img
                        v-if="accept === 'image/*'"
                        :src="getObjectURL(image)"
                        class="rounded-lg border-white object-cover h-full w-full pointer-events-none"
                    />
                    <object
                        v-else
                        :data="getObjectURL(image)"
                        class="rounded-lg border-white object-cover h-full w-full pointer-events-none"
                    />
                    <button
                        aria-label="close-information"
                        data-testid="REMOVE_FILE"
                        type="button"
                        class="text-gray-400 app-button border border-blue-200 !rounded-full !p-0 text-sm !w-6 !h-6 flex justify-center items-center absolute -top-2 -right-2 z-50"
                        oncontextmenu="return false;"
                        @click="removeLocalImages(index)"
                    >
                        <i class="material-icons-rounded text-xl">close</i>
                    </button>
                </div>
            </div>
        </div>
        <p
            :data-testid="`${name}-error`"
            :class="[
                'mt-1 text-xs italic min-h-4',
                error || localError ? 'text-red-500' : 'text-gray-400',
            ]"
        >
            {{ localError || error || helperText }}
        </p>
        <DialogView v-if="cropper" :open="showCropper" :hide="true">
            <Cropper
                :image="localFile"
                :close="toggleCropper"
                :callback="callback"
            />
        </DialogView>
    </div>
</template>

<script lang="ts">
//
import type { PropType } from 'vue';

//
import DialogView from '../dialog.vue';
import Cropper from '../cropper.vue';

//
export default {
    name: 'FileUpload',
    components: { DialogView, Cropper },
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
            type: Array as PropType<File[]>,
            default: () => [],
        },
        error: {
            default: '',
            type: String,
        },
        disabled: {
            default: false,
            type: Boolean,
        },
        multiple: {
            default: false,
            type: Boolean,
        },
        size: {
            default: 'h-52 w-full',
            type: String,
        },
        required: {
            default: false,
            type: Boolean,
        },
        accept: {
            default: 'image/*',
            type: String,
        },
        imageSize: {
            default: 'h-24 w-24',
            type: String,
        },
        max: {
            default: '1',
            type: String,
        },
        layoutClass: {
            default: '',
            type: String,
        },
        fileSize: {
            default: 52428800,
            type: Number,
        },
        cropper: {
            default: false,
            type: Boolean,
        },
    },
    emits: ['onchange'],
    data() {
        return {
            files: this.value,
            isDragging: false,
            localError: '',
            showCropper: false,
            localFile: '',
            selectedFile: null as null | File,
        };
    },
    watch: {
        value(propsValue) {
            this.files = propsValue || [];
        },
    },
    methods: {
        dragOver() {
            this.isDragging = true;
        },
        dragLeave() {
            this.isDragging = false;
        },
        onDrop(event: DragEvent) {
            this.isDragging = false;
            if (!this.disabled) {
                event.preventDefault();
                event.stopPropagation();
                this.loadFile({
                    target: { files: event.dataTransfer!.files },
                } as unknown as Event);
            }
        },
        async loadFile(event: Event) {
            this.files = [];
            this.localError = '';
            const fileInput = event.target as unknown as { files: File[] };

            if (fileInput.files && fileInput.files.length > 0) {
                if (fileInput.files.length <= +this.max) {
                    for (const file of fileInput.files) {
                        const acceptFileRegex = new RegExp(
                            this.accept.replace(/,\s?/g, '|')
                        );
                        if (acceptFileRegex.test(file.type || '')) {
                            if (file.size > this.fileSize)
                                this.localError = `Upload limit maximum ${this.byteFormat(this.fileSize, 0)} allowed`;
                            else {
                                if (this.cropper) {
                                    this.localFile = this.getObjectURL(file);
                                    this.selectedFile = file;
                                    this.showCropper = true;
                                } else {
                                    this.files.push(file);
                                    this.$emit('onchange', {
                                        name: this.name,
                                        value: this.files,
                                    });
                                }
                            }
                        } else {
                            this.localError = `${file.name} file format is invalid`;
                        }
                    }
                } else this.localError = `Maximum allowed files : ${this.max}`;
            }
        },
        getObjectURL(file: File | string) {
            return typeof file === 'string'
                ? file
                : file.type.includes('image')
                  ? URL.createObjectURL(file)
                  : '/icons/svg/file.svg';
        },
        removeLocalImages(index: number) {
            this.files = this.files.filter((_, i) => i !== index);
            this.$emit('onchange', { name: this.name, value: this.files });
        },
        toggleCropper() {
            this.showCropper = !this.showCropper;
            if (!this.showCropper) {
                this.localFile = '';
                this.selectedFile = null;
            }
        },
        callback(image: Blob) {
            this.showCropper = false;
            const file = new File([image], this.selectedFile!.name, {
                type: 'image/png',
            });
            this.selectedFile = file;
            this.files.push(file);
            this.$emit('onchange', {
                name: this.name,
                value: this.files,
            });
        },
        byteFormat(bytes: number, decimals: number) {
            if (!+bytes) return '0 Bytes';

            const k = 1024;
            const dm = decimals < 0 ? 0 : decimals;
            const sizes = [
                'Bytes',
                'KB',
                'MB',
                'GB',
                'TB',
                'PB',
                'EB',
                'ZB',
                'YB',
            ];

            const i = Math.floor(Math.log(bytes) / Math.log(k));

            return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
        },
    },
};
</script>
