import { Request } from 'src/libraries/api';
import { showToast } from 'src/providers/toast';

export const login = (payload: { email: string; password: string }) =>
    Request(
        {
            method: 'post',
            url: `v1/user/login`,
        },
        payload
    ).then(async (res) => {
        if (res.error) {
            showToast({
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
        showToast({
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
        showToast({
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
        showToast({
            type: res.error ? 'error' : 'success',
            message: res.message,
        });
        return res;
    });

export const verifyAccount = (token: string) =>
    Request(
        { method: 'get', url: `v1/user/verify` },
        {},
        {
            Authorization: `Bearer ${token}`,
        }
    );

export const getUserDetail = () =>
    Request({ method: 'get', url: `v1/user/profile` }).then((res) =>
        res.error ? res : res?.data?.user
    );

export const logout = () =>
    Request({ method: 'get', url: `v1/user/logout` }).then((res) => {
        return res.error ? res : res?.data?.user;
    });
