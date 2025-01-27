import { IService } from '../../src/handler/middleware';
import { createError } from '../../src/handler/error';
import {
    generatePasswordHash,
    verifyPassword,
} from '../../src/libraries/passwordGenerator';
import { generateToken } from '../../src/libraries/tokenGenerator';
import {
    checkUserVerifiedRepo,
    createUserRepo,
    getLocalUserByIdRepo,
    getUserByIdRepo,
    getUserBySourceRepo,
    increaseFailedAttemptRepo,
    IUser,
    updateEmailVerification,
    updatePasswordByKeyRepo,
    updatePasswordRepo,
    updateResetPasswordKeyRepo,
    updateSecretKeyRepo,
    updateUserRepo,
    updateVerificationOTP,
    updateVerificationRepo,
} from '../../src/repository/user';
import { generateSecretKey, generateId } from '../../src/utils';
import { sendMail } from '../../src/utils/mail';
import { sendOTP } from '../../src/libraries/otp';

//
import messages from '../utils/messages';

//
export const createUserService: IService<string> = async (data) => {
    if (data.phoneNumber) {
        const userPhone = await getUserBySourceRepo({
            phoneNumber: data.phoneNumber,
        });

        if (userPhone)
            throw createError(400, messages.responses.userPhoneAlreadyExist);
    }

    const userEmail = await getUserBySourceRepo({
        email: data.email,
    });

    if (userEmail)
        throw createError(400, messages.responses.userEmailAlreadyExist);

    // const verificationResult = await updateVerificationRepo(
    //     data.phoneNumber,
    //     'phone',
    //     data.otp
    // );

    // if (!verificationResult)
    //     throw createError(400, messages.responses.otpVerificationFailed);

    const userId = `USR-${generateId()}`;
    const secretKey = generateSecretKey();
    let passwordHash = null;
    if (data.password) {
        passwordHash = await generatePasswordHash(data.password);
    }

    const result = await createUserRepo({
        userId,
        secretKey,
        passwordHash,
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        profileURL: data.profileURL,
        providerId: data.providerId,
    });

    if (!result) throw createError(400, messages.responses.failedToCreateUser);

    // const payload = {
    //     userId,
    //     secretKey,
    // };

    // const newRefreshToken = await generateToken({
    //     ...payload,
    //     lastUsed: Date.now(),
    // });

    // const newAccessToken = await generateToken(payload);

    // return { refreshToken: newRefreshToken, accessToken: newAccessToken };

    return messages.responses.userCreated;
};

export const loginService: IService<{
    refreshToken: string;
    accessToken: string;
}> = async (data) => {
    const user = await getUserBySourceRepo({
        email: data.email,
    });

    if (!user) throw createError(400, messages.responses.userNotFound);

    if (!user.passwordHash)
        throw createError(400, messages.responses.noPasswordAuth);

    if (user.isSuspended) {
        const suspendTime = +process.env.ACCOUNT_SUSPEND_MINUTE! || 5;
        const suspendedAt = new Date(user.suspendedAt).getTime();
        const now = Date.now();
        const timeDiff = Math.floor((now - suspendedAt) / (1000 * 60));
        const remainingTime = suspendTime - timeDiff;
        if (timeDiff < suspendTime)
            throw createError(
                400,
                messages.responses.accountSuspended(remainingTime)
            );
    }

    const isPasswordVerified = await verifyPassword(
        data.password,
        user.passwordHash
    );
    if (!isPasswordVerified) {
        await increaseFailedAttemptRepo(user.userId);
        throw createError(400, messages.responses.invalidCred);
    }

    const isVerified = await checkUserVerified(user);
    if (!isVerified) throw createError(400, messages.responses.unverifiedUser);

    const payload = {
        userId: user.userId,
        secretKey: user.secretKey,
    };

    const newRefreshToken = await generateToken({
        ...payload,
        lastUsed: Date.now(),
    });

    const newAccessToken = await generateToken(payload);

    return { refreshToken: newRefreshToken, accessToken: newAccessToken };
};

export const getUserService: IService<Record<string, string>> = async (
    data
) => {
    const userDetail = await getUserByIdRepo(data.userId);
    return userDetail;
};

export const requestVerificationService: IService<string> = async (data) => {
    const response = { email: '', phoneNumber: '' };
    const user = await getUserBySourceRepo({
        email: data.email,
    });
    if (data.email) {
        const verification = true;

        const result = await updateEmailVerification(data.email);

        if (!result) throw createError(400, messages.responses.mailFailed);

        const verificationToken = await generateToken(
            {
                userId: user.userId,
                email: data.email,
            },
            verification
        );
        const emailVerificationLink = `${process.env.PROTOCOL}://${process.env.DOMAIN}/${process.env.VERIFICATION_URL}${verificationToken}`;

        await sendMail(
            `${process.env.MAIN_PATH}/templates/verification.ejs`,
            {
                title: 'Email verification',
                name: user.name,
                verificationLink: emailVerificationLink,
            },
            {
                to: user.email,
                subject: `Welcome to ${process.env.APP_NAME}`,
            }
        );

        response.email =
            process.env.MODE === 'development'
                ? verificationToken
                : messages.responses.mailSent;
    }
    if (data.phoneNumber) {
        const otp = Math.random().toString().substring(2, 8);

        if (process.env.MODE !== 'development') {
            const res = await sendOTP(data.phoneNumber, otp);

            if (!res) throw createError(400, messages.responses.otpFailed);
        }

        const result = await updateVerificationOTP(data.phoneNumber, otp);

        if (!result) throw createError(400, messages.responses.otpFailed);

        return process.env.MODE === 'development'
            ? otp
            : messages.responses.otpSent;
    }

    return JSON.stringify(response);
};

export const verificationEmailService = async (payload: {
    userId: string;
    email: string;
}) => {
    await updateVerificationRepo(payload.email, 'email');

    return messages.responses.verified;
};

export const verificationPhoneService = async (payload: {
    phoneNumber: string;
    otp: string;
}) => {
    await updateVerificationRepo(payload.phoneNumber, 'phone', payload.otp);

    return messages.responses.verified;
};

export const forgotPasswordService: IService<string> = async (data) => {
    const user = await getUserBySourceRepo({
        email: data.email,
    });

    if (!user) throw createError(400, messages.responses.userNotFound);

    const isVerified = await checkUserVerified(user);
    if (!isVerified) throw createError(400, messages.responses.unverifiedUser);

    const verification = true;
    const resetPasswordKey = generateSecretKey();
    const token = await generateToken(
        {
            userId: user.userId,
            resetPasswordKey,
        },
        verification
    );

    const result = await updateResetPasswordKeyRepo(
        resetPasswordKey,
        user.userId
    );

    if (!result) throw createError(400, messages.responses.failed);

    const resetPasswordLink = `${process.env.PROTOCOL}://${process.env.DOMAIN}/${process.env.RESET_PASSWORD_URL}${token}`;

    await sendMail(
        `${process.env.MAIN_PATH}/templates/reset-password.ejs`,
        {
            title: 'Reset your password',
            name: user.name,
            resetLink: resetPasswordLink,
        },
        {
            to: user.email,
            subject: 'Reset your password',
        }
    );

    return process.env.MODE === 'development'
        ? token
        : messages.responses.mailSent;
};

export const changePasswordService: IService<string> = async (data) => {
    const user = await getLocalUserByIdRepo(data.userId);
    const secretKey = generateSecretKey();

    if (!user) throw createError(400, messages.responses.userNotFound);

    const isPasswordVerified = await verifyPassword(
        data.password,
        user.passwordHash
    );

    if (isPasswordVerified)
        throw createError(400, messages.responses.previousPasswordError);

    const passwordHash = await generatePasswordHash(data.password);

    const result = await updatePasswordByKeyRepo(
        passwordHash,
        user.userId,
        secretKey,
        data.resetPasswordKey
    );

    if (!result)
        throw createError(400, messages.responses.passwordChangeFailed);

    return messages.responses.passwordChanged;
};

export const updatePasswordService: IService<string> = async (data) => {
    const user = await getLocalUserByIdRepo(data.userId);

    if (!user) throw createError(400, messages.responses.userNotFound);

    const isPasswordVerified = await verifyPassword(
        data.currentPassword,
        user.passwordHash
    );

    if (!isPasswordVerified)
        throw createError(400, messages.responses.passwordDoesNotMatch);

    const passwordHash = await generatePasswordHash(data.password);

    const result = await updatePasswordRepo(passwordHash, user.userId);

    if (!result)
        throw createError(400, messages.responses.passwordChangeFailed);

    return messages.responses.passwordChanged;
};

export const logoutService: IService<string> = async (data) => {
    const secretKey = generateSecretKey();

    await updateSecretKeyRepo(secretKey, data.userId);

    return '';
};

export const updateUserService: IService<string> = async (data) => {
    const result = await updateUserRepo(data.userId, {
        name: data.name,
        profileURL: data.profileURL,
    });

    if (!result) throw createError(400, messages.responses.userUpdateFailed);

    return messages.responses.userUpdated;
};

// Utils
export const checkUserVerified = async (user: IUser) => {
    let emailVerified = false;
    let phoneNumberVerified = false;

    if (user.email) {
        emailVerified = await checkUserVerifiedRepo(user.email);
    }

    if (user.phoneNumber) {
        phoneNumberVerified = await checkUserVerifiedRepo(user.phoneNumber);
    }

    return emailVerified || phoneNumberVerified;
};
