import * as Axios from 'axios';
import { baseURL } from 'src/constants';
import { encrypt } from 'src/repository/utils';

const client = Axios.default.create({
    baseURL,
    withCredentials: true,
});

export const updatePublicKey = async () => {
    await Request({
        method: 'get',
        url: `v1/security/publicKey`,
    }).then((data) => {
        localStorage.setItem('publicKey', data.publicKey);
        return data;
    });
};

export const Request = async (
    options: Axios.AxiosRequestConfig,
    data?: object,
    headers?: Axios.RawAxiosRequestHeaders
): Promise<ILargeRecord & { error: boolean }> => {
    const _call = async () => {
        const encryptedData = await encrypt(data);
        const response = await client({
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
            data: { encryptedData },
        })
            .then((res) => res.data)
            .catch((e) => {
                if (e.code === 'ERR_NETWORK') {
                    return { error: true, message: 'No internet connection' };
                }

                if (e.response?.data?.message === 'KEY_EXPIRED')
                    return { error: true, message: e.response?.data?.message };

                // if (e.config.baseURL == baseURL && e.response.status === 401) {
                //     // window.location.reload();
                //     return {
                //         error: true,
                //         message: 'Token expired please login',
                //     };
                // }

                return e.response?.data;
            });

        if (response.message === 'KEY_EXPIRED') {
            await updatePublicKey();
            return await _call();
        }

        return response;
    };

    return await _call();
};
