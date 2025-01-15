<template>
    <div>
        <div
            class="fixed top-2 right-2 z-50 flex flex-col gap-2"
            data-testid="TOAST"
        >
            <Toast
                v-for="toast in toasts"
                :key="toast.timestamp"
                :toast="toast"
            />
        </div>
        <RouterView />
    </div>
</template>

<script lang="ts">
import { RouterView } from 'vue-router';

//
import { appStore } from 'src/store';
import Toast from 'src/app/components/toast.vue';

//
export default {
    name: 'App',
    components: {
        Toast,
        RouterView,
    },
    computed: {
        toasts() {
            return appStore.state.toasts.filter(Boolean);
        },
    },
    created() {
        document.getElementsByTagName('title')[0]!.innerText =
            import.meta.env.VITE_APP_NAME;
    },
};
</script>
