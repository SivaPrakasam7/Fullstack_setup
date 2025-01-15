import Vuex from 'vuex';
import VuexPersistense from 'vuex-persist';

//
import { IAppStoreProps, IStoreProps } from './index.types';
import { appMutations, mutations } from './mutations';

//
export const storage = new VuexPersistense({
    key: import.meta.env.VITE_APP_NAME,
    storage: window.localStorage,
});

export const store = new Vuex.Store<IStoreProps>({
    state: {
        user: {},
        token: '',
    },
    mutations: mutations,
    plugins: [storage.plugin],
});

export const appStore = new Vuex.Store<IAppStoreProps>({
    state: {
        toasts: [],
    },
    mutations: appMutations,
});
