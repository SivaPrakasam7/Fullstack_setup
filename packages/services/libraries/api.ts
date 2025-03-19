import * as Axios from 'axios';
import { baseURL } from '../constants';
import { encrypt } from '../repository/utils';

const client = Axios.default.create({
    baseURL,
    withCredentials: true,
});

export const updatePublicKey = async () => {
    await Request({
        method: 'get',
        url: `v1/security/keyPair`,
    }).then((data) => {
        if (data.publicKey) {
            localStorage.setItem('publicKey', data.publicKey);
            localStorage.setItem('privateKey', data.privateKey);
        }
        return data;
    });
};

export const Request = async (
    options: Axios.AxiosRequestConfig,
    data?: object,
    headers?: Axios.RawAxiosRequestHeaders
): Promise<ILargeRecord & { error: boolean }> => {
    let reTriggered = false;
    const _call = async () => {
        const encryptedData =
            headers?.['Content-Type'] === 'multipart/form-data'
                ? data
                : await encrypt(data);

        const response = await client({
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
            data: encryptedData,
        })
            .then((res) => res.data)
            .catch((e) => {
                if (e.code === 'ERR_NETWORK') {
                    return { error: true, message: 'No internet connection' };
                }

                if (e.response?.status === 429) {
                    window.showToast({
                        type: 'error',
                        message: e.response?.data,
                    });
                    return { error: true, message: e.response?.data };
                }

                if (e.response?.data?.message === 'KEY_EXPIRED')
                    return { error: true, message: e.response?.data?.message };

                if (
                    e.config?.baseURL == baseURL &&
                    e.response?.status === 401 &&
                    window.signedIn
                ) {
                    window.logout();
                    return {
                        error: true,
                        message: 'Token expired please login',
                    };
                }

                return {
                    error: true,
                    message: e.response?.data?.message || 'Not found',
                    code: e.response?.status,
                };
            });

        if (response.message === 'KEY_EXPIRED' && !reTriggered) {
            reTriggered = true;
            await updatePublicKey();
            return await _call();
        }

        return response;
    };

    return await _call();
};
