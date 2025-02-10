import * as yup from 'yup';

export const emailValidation = yup.object().shape({
    email: yup
        .string()
        .email('Email must be valid')
        .required('Email is required'),
});

export const phoneValidation = yup.object().shape({
    phoneNumber: yup.string().required('Phone number is required'),
});

export const passwordValidation = yup.object().shape({
    password: yup.string().required('Password is required'),
});

export const requestVerificationValidation = yup
    .object()
    .shape({
        email: yup.string().email('Email must be valid'),
        phoneNumber: yup.string(),
    })
    .test(
        'either-email-or-phoneNumber',
        'Either email or phoneNumber is required',
        (value) => {
            const { email, phoneNumber } = value || {};
            return !!email || !!phoneNumber;
        }
    );

export const updatePasswordValidation = yup
    .object()
    .shape({
        currentPassword: yup.string().required('Current password is required'),
    })
    .concat(passwordValidation);

export const createUserValidation = yup
    .object()
    .shape({
        name: yup.string().required('Name is required'),
        password: yup.string(),
        providerId: yup.string(),
        profileURL: yup.string(),
    })
    .concat(emailValidation)
    // .concat(phoneValidation)
    .test(
        'either-password-or-providerId',
        'Either password or providerId is required',
        (value) => {
            const { password, providerId } = value || {};
            return !!password || !!providerId;
        }
    );

export const updateUserValidation = yup.object().shape({
    name: yup.string(),
    profileURL: yup.string(),
});

export const loginValidation = yup
    .object()
    .shape({
        password: yup.string().required('Password is required'),
    })
    .concat(emailValidation);

export const phoneVerificationValidation = yup
    .object()
    .shape({
        otp: yup.string().required('OTP is required'),
    })
    .concat(phoneValidation);

export const verificationRequestValidation =
    emailValidation.concat(phoneValidation);

export const userIdValidation = yup.object().shape({
    userId: yup.string().required('User ID is required'),
});
