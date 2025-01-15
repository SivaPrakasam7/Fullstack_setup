const baseURL = import.meta.env.BASE_URL;

export const routes = {
    root: baseURL,
    signIn: `${baseURL}sign-in`,
    signUp: `${baseURL}sign-up`,
    forgotPassword: `${baseURL}forgot-password`,
    resetPassword: `${baseURL}reset-password`,
    verify: `${baseURL}verify`,
};
