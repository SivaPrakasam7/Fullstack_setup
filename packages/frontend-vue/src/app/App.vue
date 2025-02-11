<template>
    <div>
        <div class="fixed top-2 right-2 z-50 flex flex-col gap-2">
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
import { routes } from 'services/constants/routes';
import { appStore, store } from 'src/store';
import router from 'src/app/router';

//
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

        document.documentElement.style.setProperty(
            '--scale-factor',
            window.devicePixelRatio.toString()
        );
        if (window.devicePixelRatio >= 1 && window.innerWidth > 768) {
            const scale = 1 / window.devicePixelRatio;
            document.body.style.zoom = `${scale}`;
        }

        window.logout = () => {
            store.commit('clearUser');
            router.push({ path: routes.root });
        };
        window.showToast = (toast) => {
            appStore.commit('setToast', toast);
        };
    },
};
</script>
