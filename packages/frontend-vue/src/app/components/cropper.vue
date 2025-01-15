<template>
    <div class="p-2 flex flex-col gap-5">
        <canvas
            ref="cropperContainer"
            style="width: 250px; height: 200px"
        ></canvas>
        <div class="flex flex-row gap-2 items-center w-full justify-between">
            <button
                type="button"
                title="Zoom in"
                class="flex gap-2 whitespace-nowrap bg-blue-400 items-center border-blue-600 border !text-white p-1 px-2.5 rounded-lg"
                oncontextmenu="return false;"
                @click="() => cropper?.zoom(0.1)"
            >
                <i class="material-icons-rounded text-xl">zoom_in</i>
            </button>
            <button
                type="button"
                title="Zoom out"
                class="flex gap-2 whitespace-nowrap bg-blue-400 items-center border-blue-600 border !text-white p-1 px-2.5 rounded-lg"
                oncontextmenu="return false;"
                @click="() => cropper?.zoom(-0.1)"
            >
                <i class="material-icons-rounded text-xl">zoom_out</i>
            </button>
            <button
                type="button"
                title="Rotate left"
                class="flex gap-2 whitespace-nowrap bg-blue-400 items-center border-blue-600 border !text-white p-1 px-2.5 rounded-lg"
                oncontextmenu="return false;"
                @click="() => cropper?.rotate(-45)"
            >
                <i class="material-icons-rounded text-xl">rotate_left</i>
            </button>
            <button
                type="button"
                title="Rotate right"
                class="flex gap-2 whitespace-nowrap bg-blue-400 items-center border-blue-600 border !text-white p-1 px-2.5 rounded-lg"
                oncontextmenu="return false;"
                @click="() => cropper?.rotate(45)"
            >
                <i class="material-icons-rounded text-xl">rotate_right</i>
            </button>
        </div>
        <div class="flex justify-center gap-2 items-center">
            <button
                type="button"
                class="flex gap-2 h-fit whitespace-nowrap bg-blue-400 items-center border-blue-600 border !text-white p-1 px-3 rounded-lg"
                oncontextmenu="return false;"
                @click="cropImage"
            >
                Save
            </button>
            <button
                type="button"
                class="flex gap-2 h-fit whitespace-nowrap bg-red-400 items-center border-red-600 border !text-white p-1 px-3 rounded-lg"
                oncontextmenu="return false;"
                @click="close"
            >
                Cancel
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import { PropType } from 'vue';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';

export default {
    name: 'CropperView',
    props: {
        image: {
            type: String,
            required: true,
        },
        close: {
            type: Function as PropType<() => void>,
            required: true,
        },
        callback: {
            type: Function as PropType<(image: Blob) => void>,
            required: true,
        },
    },
    data() {
        return {
            cropper: null as null | Cropper,
        };
    },
    mounted() {
        this.cropper = new Cropper(
            this.$refs.cropperContainer as HTMLImageElement,
            {
                aspectRatio: 1,
                viewMode: 1,
                autoCropArea: 0.8,
                dragMode: 'move',
                cropBoxMovable: false,
                cropBoxResizable: false,
                zoomable: true,
                center: true,
                background: false,
                modal: true,
                minCropBoxHeight: 200,
                minCropBoxWidth: 200,
            }
        );
        this.cropper.replace(this.image);
    },
    methods: {
        cropImage() {
            if (!this.cropper) return;
            this.cropper.getCroppedCanvas().toBlob((blob) => {
                this.callback(blob as Blob);
            });
        },
    },
};
</script>
