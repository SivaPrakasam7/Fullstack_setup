import { createRouter, createWebHistory } from 'vue-router';

//
import { routes } from 'services/constants/routes';
import { store } from 'src/store';

//
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: routes.root,
            name: 'main',
            component: () => import('src/app/pages/main.vue'),
        },
        {
            path: routes.signIn,
            name: 'signIn',
            component: () => import('src/app/pages/authentication/signIn.vue'),
            meta: {
                noAuth: true,
            },
        },
        {
            path: routes.signUp,
            name: 'signUp',
            component: () => import('src/app/pages/authentication/signUp.vue'),
            meta: {
                noAuth: true,
            },
        },
        {
            path: routes.forgotPassword,
            name: 'forgotPassword',
            component: () =>
                import('src/app/pages/authentication/forgotPassword.vue'),
            meta: {
                noAuth: true,
            },
        },
        {
            path: routes.resetPassword,
            name: 'resetPassword',
            component: () =>
                import('src/app/pages/authentication/resetPassword.vue'),
            meta: {
                noAuth: true,
                token: true,
            },
        },
        {
            path: routes.verify,
            name: 'verification',
            component: () =>
                import('src/app/pages/authentication/verification.vue'),
            meta: {
                token: true,
            },
            props: {
                content: 'Account verified',
            },
        },
        {
            path: '/:pathMatch(.*)*',
            name: 'not-found',
            component: () => import('src/app/components/page.vue'),
            meta: {
                defaultDomain: true,
            },
            props: {
                content: '404 Page Not Found',
            },
        },
    ],
});

router.beforeEach((to, _, next) => {
    store.commit('getProfile', () => {
        if (
            to.matched.some(
                (record) => record.meta.auth && !store.state.user?.id
            ) ||
            to.matched.some(
                (record) => record.meta.noAuth && store.state.user?.id
            ) ||
            to.matched.some((record) => record.meta.token && !to.query.token)
        ) {
            return next({ name: 'main' });
        }

        return next();
    });
});

export default router;
