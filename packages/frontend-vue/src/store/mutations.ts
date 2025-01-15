import Vuex from 'vuex';

//
import { getUserDetail } from 'src/repository/authentication';

//
import type { IAppStoreProps, IStoreProps, IToast } from './index.types';

//
export const mutations: Vuex.MutationTree<IStoreProps> = {
    getProfile: async (state, callback?: () => void) => {
        if (
            state.user?.userId &&
            localStorage.getItem('lastAccessedDomain') === window.location.host
        ) {
            callback?.();
            return;
        }
        state.user = await getUserDetail();

        localStorage.setItem('lastAccessedDomain', window.location.host);
        callback?.();
    },
    clearUser: async (state) => {
        state.user = null;
    },
};

export const appMutations: Vuex.MutationTree<IAppStoreProps> = {
    setToast: (state, data: IToast) => {
        if (state.toasts.length === 3) {
            state.toasts = state.toasts.slice(1);
        }
        state.toasts.push({ ...data, duration: 5000, timestamp: Date.now() });
    },
};
