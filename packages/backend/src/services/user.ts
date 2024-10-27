import { createError } from 'src/handler/error';
import { IService } from 'src/handler/middleware';
import {
    generatePasswordHash,
    verifyPassword,
} from 'src/libraries/passwordGenerator';
import { generateToken } from 'src/libraries/tokenGenerator';
import {
    checkUserVerifiedRepo,
    createUserRepo,
    getUserByIdRepo,
    getUserBySourceRepo,
    updatePasswordRepo,
    updateVerification,
} from 'src/repository/user';
import { generateSecretKey, generateUserId } from 'src/utils';
import { sendMail } from 'src/utils/mail';

//
import messages from 'src/utils/messages.json';

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

    const token = await generateToken({ userId, secretKey });

    await requestVerificationService(userId);

    return token;
};

export const loginService: IService<string> = async (data) => {
    const user = await getUserBySourceRepo({
        email: data.email,
    });

    if (!user) throw createError(400, messages.responses.userNotFound);

    if (!user.passwordHash)
        throw createError(400, messages.responses.noPasswordAuth);

    const isPasswordVerified = await verifyPassword(
        data.password,
        user.passwordHash
    );
    if (!isPasswordVerified)
        throw createError(400, messages.responses.invalidCred);

    const isSourceVerified = await checkUserVerifiedRepo(data.email);
    if (!isSourceVerified)
        throw createError(400, messages.responses.unverifiedUser);

    const token = await generateToken({
        userId: user.userId,
        secretKey: user.secretKey,
    });
    return token;
};

export const getUserService: IService<Record<string, string>> = async (
    data
) => {
    const userDetail = await getUserByIdRepo(data.userId);
    return userDetail;
};

export const requestVerificationService = async (userId: string) => {
    const user = await getUserByIdRepo(userId);

    const verificationToken = await generateToken({
        userId,
        email: user.email,
    });
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

    return messages.responses.mailSent;
};

export const verificationService = async (payload: {
    userId: string;
    email: string;
}) => {
    await updateVerification(payload.email);

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

    const token = await generateToken({
        userId: user.userId,
        email: user.email,
    });

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

    return messages.responses.mailSent;
};

export const changePasswordService: IService<string> = async (data) => {
    const user = await getUserByIdRepo(data.userId);

    if (!user) throw createError(400, messages.responses.userNotFound);

    const passwordHash = await generatePasswordHash(data.password);

    const isPasswordVerified = await verifyPassword(
        data.password,
        user.passwordHash
    );

    if (isPasswordVerified)
        throw createError(400, messages.responses.previousPasswordError);

    const result = await updatePasswordRepo(passwordHash, user.userId);

    if (!result)
        throw createError(400, messages.responses.passwordChangeFailed);

    return messages.responses.passwordChanged;
};
