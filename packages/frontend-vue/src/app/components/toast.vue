<template>
    <div
        v-if="show"
        class="flex items-center max-w-[400px] w-full p-2 mb-4 rounded-lg shadow-2xl"
        :class="[
            toast.type === 'success'
                ? 'bg-green-100'
                : toast.type === 'error'
                  ? 'bg-red-100'
                  : toast.type === 'warning'
                    ? ' bg-orange-100'
                    : ' bg-blue-100',
        ]"
        role="alert"
    >
        <div
            v-if="toast.type === 'success'"
            class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200"
        >
            <SvgIcon
                path="/icons/svg/check_circle.svg"
                class="h-6 w-6"
            ></SvgIcon>
        </div>
        <div
            v-if="toast.type === 'info'"
            class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-blue-500 bg-blue-100 rounded-lg dark:bg-blue-800 dark:text-blue-200"
        >
            <SvgIcon path="/icons/svg/info.svg" class="h-6 w-6"></SvgIcon>
        </div>
        <div
            v-if="toast.type === 'error'"
            class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-red-500 bg-red-100 rounded-lg dark:bg-red-800 dark:text-red-200"
        >
            <SvgIcon path="/icons/svg/error.svg" class="h-6 w-6"></SvgIcon>
        </div>
        <div
            v-if="toast.type === 'warning'"
            class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-orange-500 bg-orange-100 rounded-lg dark:bg-orange-700 dark:text-orange-200"
        >
            <SvgIcon path="/icons/svg/warning.svg" class="h-6 w-6"></SvgIcon>
        </div>
        <div
            class="mx-3 text-sm font-normal"
            :class="[
                toast.type === 'success'
                    ? 'text-green-500'
                    : toast.type === 'error'
                      ? 'text-red-500'
                      : toast.type === 'warning'
                        ? ' text-orange-500'
                        : ' text-blue-500',
            ]"
        >
            {{ toast.message }}
        </div>
        <button
            class="ms-auto -mx-1.5 -my-1.5 text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 f p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8"
            data-dismiss-target="#toast-success"
            aria-label="Close"
            oncontextmenu="return false;"
            @click="close()"
        >
            <SvgIcon path="/icons/svg/close.svg" class="h-6 w-6"></SvgIcon>
        </button>
    </div>
</template>

<script lang="ts">
import { PropType } from 'vue';

//
import { IToast } from 'src/store/index.types';

//
import SvgIcon from './svg.vue';

//
export default {
    name: 'ToastView',
    components: { SvgIcon },
    props: {
        toast: {
            required: true,
            type: Object as PropType<IToast>,
        },
    },
    data() {
        return { show: true };
    },
    mounted() {
        setTimeout(() => {
            this.show = false;
        }, this.toast.duration);
    },
    methods: {
        close() {
            this.show = false;
        },
    },
};
</script>
