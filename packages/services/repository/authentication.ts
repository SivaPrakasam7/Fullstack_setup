import { Request } from '../libraries/api';

//
export const login = (payload: { email: string; password: string }) =>
    Request(
        {
            method: 'post',
            url: `v1/user/login`,
        },
        payload
    ).then(async (res) => {
        if (res.error) {
            window.showToast({
                type: 'error',
                message: res.message,
            });
        }
        return res;
    });

export const register = (payload: {
    name: string;
    email: string;
    password: string;
}) =>
    Request(
        {
            method: 'post',
            url: `v1/user/create`,
        },
        payload
    ).then((res) => {
        window.showToast({
            type: res.error ? 'error' : 'success',
            message: res.message,
        });
        return res;
    });

export const requestResetPassword = (payload: { email: string }) =>
    Request(
        {
            method: 'post',
            url: `v1/user/request-reset-password`,
        },
        payload
    ).then((res) => {
        window.showToast({
            type: res.error ? 'error' : 'success',
            message: res.message,
        });
        return res;
    });

export const changePassword = (payload: { password: string }, token: string) =>
    Request(
        {
            method: 'post',
            url: `v1/user/change-password`,
        },
        payload,
        {
            Authorization: `Bearer ${token}`,
        }
    ).then((res) => {
        window.showToast({
            type: res.error ? 'error' : 'success',
            message: res.message,
        });
        return res;
    });

export const requestVerification = (payload: {
    email?: string;
    phoneNumber?: string;
}) =>
    Request(
        {
            method: 'post',
            url: `v1/user/request-verification`,
        },
        payload
    ).then((res) => {
        window.showToast({
            type: res.error ? 'error' : 'success',
            message: res.message,
        });
        return res;
    });

export const verifyEmailAccount = (token: string) =>
    Request(
        { method: 'get', url: `v1/user/verify-email` },
        {},
        {
            Authorization: `Bearer ${token}`,
        }
    );

export const getUserDetail = () =>
    Request({ method: 'get', url: `v1/user/profile` }).then((res) =>
        res.error ? res : res?.data?.user
    );

export const updateUser = (payload: Record<string, string>) =>
    Request(
        {
            method: 'put',
            url: 'v1/user/update',
        },
        payload
    ).then((res) => {
        window.showToast({
            type: res.error ? 'error' : 'success',
            message: res.message,
        });
        return res;
    });

export const updatePassword = (payload: Record<string, string>) =>
    Request(
        {
            method: 'put',
            url: 'v1/user/update-password',
        },
        payload
    ).then((res) => {
        window.showToast({
            type: res.error ? 'error' : 'success',
            message: res.message,
        });
        return res;
    });

export const logout = (all = false) =>
    Request({ method: 'post', url: `v1/user/logout` }, { all }).then((res) => {
        window.logout();
        return res.error ? res : res?.data?.user;
    });
