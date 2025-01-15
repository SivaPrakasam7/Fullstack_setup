import * as Axios from 'axios';
import { baseURL } from 'src/constants';
import { store } from 'src/store';
import router from 'src/app/router';

const client = Axios.default.create({
    baseURL,
    withCredentials: true,
});

export const Request = (
    options: Axios.AxiosRequestConfig,
    data?: object,
    headers?: Axios.RawAxiosRequestHeaders
): Promise<ILargeRecord & { error: boolean }> => {
    return client({
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
        data,
    })
        .then((res) => res.data)
        .catch((e) => {
            if (e.code === 'ERR_NETWORK') {
                return { error: true, message: 'No internet connection' };
            }

            if (
                e.config.baseURL == baseURL &&
                e.response.status === 401 &&
                store.state.user?.id
            ) {
                store.commit('clearUser');
                router.push({ name: 'main' });
                return { error: true, message: 'Token expired please login' };
            }

            return e.response?.data;
        });
};
