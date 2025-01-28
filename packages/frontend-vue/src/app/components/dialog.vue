<template>
    <div
        ref="dialog"
        data-testid="DIALOG_BACKGROUND"
        :class="[
            'fixed bottom-0 left-1/2 -translate-x-1/2 no-scrollbar flex items-center justify-center overflow-hidden duration-500',
            open
                ? '!w-screen !h-dvh opacity-100 z-10 backdrop-blur-sm'
                : '!w-0 !h-0 !opacity-0 -z-0',
        ]"
        @click="closeDialog()"
    >
        <div
            class="no-scrollbar rounded max-h-[calc(100vh-50px)]"
            @click="(e) => e.stopPropagation()"
        >
            <div
                v-if="show"
                :class="[
                    'w-full h-auto rounded-2xl relative bg-white dark:bg-black border',
                    contentClass,
                ]"
            >
                <button
                    v-if="!hideClose"
                    class="text-gray-400 bg-white dark:bg-black app-button border !rounded-full !p-0 text-sm !w-8 !h-8 flex justify-center items-center absolute -top-3 -right-3"
                    oncontextmenu="return false;"
                    @click="closeDialog()"
                >
                    <SvgIcon
                        path="/icons/svg/close.svg"
                        class="w-5 h-5"
                    ></SvgIcon>
                </button>
                <div class="overflow-hidden overflow-y-auto">
                    <slot />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import SvgIcon from './svg.vue';

//
export default {
    name: 'DialogView',
    components: {
        SvgIcon,
    },
    props: {
        open: {
            default: false,
            type: Boolean,
        },
        hideClose: {
            default: false,
            type: Boolean,
        },
        contentClass: {
            default: 'p-5',
            type: String,
        },
        targetId: {
            default: '',
            type: String,
        },
    },
    emits: ['onClose'],
    data() {
        return {
            show: false,
        };
    },
    watch: {
        open(v) {
            if (this.targetId) {
                if (v) {
                    const dialog = this.$refs.dialog as HTMLElement;
                    Object.assign(dialog.style, {
                        left: 'auto',
                        right: `0px`,
                        bottom: `0px`,
                    });
                } else {
                    this.fitPosition();
                }
            }
            if (v) {
                this.show = true;
            } else {
                setTimeout(() => {
                    this.show = false;
                }, 300);
            }
        },
    },
    mounted() {
        this.show = this.open;
        if (this.targetId) {
            setTimeout(() => {
                this.fitPosition();
            }, 1000);
        }
    },
    methods: {
        fitPosition() {
            try {
                const dialog = this.$refs.dialog as HTMLElement;
                const elementRect = Array.from(
                    document.querySelectorAll(
                        `[data-dialog-id*="${this.targetId}"]`
                    )
                ).find((el) => (el as HTMLElement).offsetParent !== null);
                if (elementRect) {
                    const rect = elementRect.getBoundingClientRect();

                    const { innerWidth, innerHeight } = window;
                    const { x, y } = rect;

                    Object.assign(dialog.style, {
                        top: 'auto',
                        right: `${innerWidth - x}px`,
                        bottom: `${innerHeight - y}px`,
                        transform: 'translateX(0)',
                    });
                }
            } catch {
                //
            }
        },
        closeDialog() {
            this.$emit('onClose');
        },
    },
};
</script>
