import { createError } from '../../src/handler/error';
import { IService } from '../../src/handler/middleware';
import {
    generatePasswordHash,
    verifyPassword,
} from '../../src/libraries/passwordGenerator';
import { generateToken } from '../../src/libraries/tokenGenerator';
import {
    checkUserVerifiedRepo,
    createUserRepo,
    getUserByIdRepo,
    getUserBySourceRepo,
    increaseFailedAttemptRepo,
    updatePasswordRepo,
    updateResetPasswordKeyRepo,
    updateVerificationRepo,
} from '../../src/repository/user';
import { generateSecretKey, generateUserId } from '../../src/utils';
import { sendMail } from '../../src/utils/mail';

//
import messages from '../utils/messages';

//
export const createUserService: IService<string> = async (data) => {
    const user = await getUserBySourceRepo({
        email: data.email,
    });

    if (user) throw createError(400, messages.responses.userAlreadyExist);

    const userId = generateUserId();
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
        profileURL: data.profileURL,
        providerId: data.providerId,
    });

    if (!result) throw createError(400, messages.responses.failedToCreateUser);

    const token = await requestVerificationService(userId);

    return process.env.MODE === 'development'
        ? token
        : messages.responses.userCreated;
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

    const isSourceVerified = await checkUserVerifiedRepo(data.email);
    if (!isSourceVerified)
        throw createError(400, messages.responses.unverifiedUser);

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

export const requestVerificationService = async (userId: string) => {
    const user = await getUserByIdRepo(userId);
    const verification = true;

    const verificationToken = await generateToken(
        {
            userId,
            email: user.email,
        },
        verification
    );
    const emailVerificationLink = `${process.env.PROTOCOL}://${process.env.DOMAIN}/${process.env.VERIFICATION_URL}${verificationToken}`;

    await sendMail(
        '../templates/verification.ejs',
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

    return process.env.MODE === 'development'
        ? verificationToken
        : messages.responses.mailSent;
};

export const verificationService = async (payload: {
    userId: string;
    email: string;
}) => {
    await updateVerificationRepo(payload.email);

    return messages.responses.verified;
};

export const forgotPasswordService: IService<string> = async (data) => {
    const user = await getUserBySourceRepo({
        email: data.email,
    });

    if (!user) throw createError(400, messages.responses.userNotFound);

    const isSourceVerified = await checkUserVerifiedRepo(data.email);

    if (!isSourceVerified)
        throw createError(400, messages.responses.unverifiedUser);

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
        '../templates/reset-password.ejs',
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
    const user = await getUserByIdRepo(data.userId);
    const secretKey = generateSecretKey();

    if (!user) throw createError(400, messages.responses.userNotFound);

    const passwordHash = await generatePasswordHash(data.password);

    const isPasswordVerified = await verifyPassword(
        data.password,
        user.passwordHash
    );

    if (isPasswordVerified)
        throw createError(400, messages.responses.previousPasswordError);

    const result = await updatePasswordRepo(
        passwordHash,
        user.userId,
        secretKey,
        data.resetPasswordKey
    );

    if (!result)
        throw createError(400, messages.responses.passwordChangeFailed);

    return messages.responses.passwordChanged;
};
