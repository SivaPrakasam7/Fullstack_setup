const baseURL = import.meta.env.BASE_URL;

export const routes = {
    root: baseURL,
    signIn: `${baseURL}sign-in`,
    signUp: `${baseURL}sign-up`,
    forgotPassword: `${baseURL}forgot-password`,
    resetPassword: `${baseURL}reset-password`,
    verify: `${baseURL}verify`,
    app: `${baseURL}app`,
    settings: `${baseURL}settings`,
    privacyPolicy: `${baseURL}privacy-policy`,
    termsAndConditions: `${baseURL}terms-and-condition`,
    maintenance: `${baseURL}maintenance`,
    404: `${baseURL}404`,
};

export const links = {
    github: 'https://github.com/SivaPrakasam7',
    linkedIn: 'https://linkedin.com/in/siva-prakasam',
    mail: 'mailto:prakasams22@gmail.com',
    contact: 'https://wa.me/+916382657699',
};
