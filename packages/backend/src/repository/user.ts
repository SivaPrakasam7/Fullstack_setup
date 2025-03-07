import { executeQuery } from '../../src/handler/db.ts';

export const getUserByIDandSecretKeyRepo = async (
    userId: string,
    secretKey: string
) => {
    const query = `CALL GetUserByIDandSecretKey(?, ?)`;
    const queryResponse = await executeQuery(query, [userId, secretKey]);
    return queryResponse[0][0]; // First result set, first row
};

export const createUserRepo = async ({
    userId,
    name,
    email,
    phoneNumber,
    profileURL,
    passwordHash,
    providerId,
    secretKey,
}: IUser) => {
    const query = `CALL CreateUser(?, ?, ?, ?, ?, ?, ?, ?, @insertId)`;
    const queryResponse = await executeQuery(query, [
        userId,
        name,
        email,
        phoneNumber,
        profileURL,
        passwordHash,
        providerId,
        secretKey,
    ]);
    return queryResponse[0][0].insertId; // First result set contains insertId
};

export const updateEmailVerification = async (email: string) => {
    const query = `CALL UpdateEmailVerification(?, @affectedRows)`;
    const queryResponse = await executeQuery(query, [email]);
    return queryResponse[0][0].affectedRows; // First result set contains affectedRows
};

export const updateVerificationOTP = async (
    phoneNumber: string,
    otp: string
) => {
    const query = `CALL UpdateVerificationOTP(?, ?, @affectedRows)`;
    const queryResponse = await executeQuery(query, [phoneNumber, otp]);
    return queryResponse[0][0].affectedRows; // First result set contains affectedRows
};

export const updateVerificationRepo = async (
    source: string,
    type: 'email' | 'phone',
    otp?: string
) => {
    const query = `CALL UpdateVerification(?, ?, ?, @affectedRows)`;
    const queryResponse = await executeQuery(query, [
        source,
        type,
        otp || null,
    ]);
    return queryResponse[0][0].affectedRows; // First result set contains affectedRows
};

export const getUserBySourceRepo = async ({
    email,
    phoneNumber,
}: {
    email?: string;
    phoneNumber?: string;
}) => {
    const query = `CALL GetUserBySource(?, ?)`;
    const queryResponse = await executeQuery(query, [
        email || null,
        phoneNumber || null,
    ]);
    return queryResponse[0][0]; // First result set, first row
};

export const checkUserVerifiedRepo = async (source: string) => {
    const query = `CALL CheckUserVerified(?, @count)`;
    const queryResponse = await executeQuery(query, [source]);
    return queryResponse[0][0].count; // First result set contains count
};

export const getUserByIdRepo = async (userId: string) => {
    const query = `CALL GetUserById(?)`;
    const queryResponse = await executeQuery(query, [userId]);
    return queryResponse[0][0]; // First result set, first row
};

export const getLocalUserByIdRepo = async (userId: string) => {
    const query = `CALL GetLocalUserById(?)`;
    const queryResponse = await executeQuery(query, [userId]);
    return queryResponse[0][0]; // First result set, first row
};

export const updateResetPasswordKeyRepo = async (
    resetPasswordKey: string,
    userId: string
) => {
    const query = `CALL UpdateResetPasswordKey(?, ?, @affectedRows)`;
    const queryResponse = await executeQuery(query, [resetPasswordKey, userId]);
    return queryResponse[0][0].affectedRows; // First result set contains affectedRows
};

export const updatePasswordByKeyRepo = async (
    passwordHash: string,
    userId: string,
    secretKey: string,
    resetPasswordKey: string
) => {
    const query = `CALL UpdatePasswordByKey(?, ?, ?, ?, @affectedRows)`;
    const queryResponse = await executeQuery(query, [
        passwordHash,
        userId,
        secretKey,
        resetPasswordKey,
    ]);
    return queryResponse[0][0].affectedRows; // First result set contains affectedRows
};

export const updatePasswordRepo = async (
    passwordHash: string,
    userId: string
) => {
    const query = `CALL UpdatePassword(?, ?, @affectedRows)`;
    const queryResponse = await executeQuery(query, [passwordHash, userId]);
    return queryResponse[0][0].affectedRows; // First result set contains affectedRows
};

export const increaseFailedAttemptRepo = async (userId: string) => {
    const query = `CALL IncreaseFailedAttempt(?, @affectedRows)`;
    const queryResponse = await executeQuery(query, [userId]);
    return queryResponse[0][0].affectedRows; // First result set contains affectedRows
};

export const updateSecretKeyRepo = async (
    secretKey: string,
    userId: string
) => {
    const query = `CALL UpdateSecretKey(?, ?, @affectedRows)`;
    const queryResponse = await executeQuery(query, [secretKey, userId]);
    return queryResponse[0][0].affectedRows; // First result set contains affectedRows
};

// Note: updateUserRepo remains unchanged as it doesn't use a stored procedure
export const updateUserRepo = async (userId: string, user: Partial<IUser>) => {
    const query = `UPDATE users SET ${Object.entries(user)
        .map(
            ([key, value]) =>
                `${key}=${key === 'lastLoginTime' ? 'CURRENT_TIMESTAMP' : `'${value}'`}`
        )
        .join(', ')} WHERE userId=? AND isDeleted=0`;
    const queryResponse = await executeQuery(query, [userId]);
    return queryResponse.affectedRows; // Direct result from UPDATE
};

export interface IUser {
    userId: string;
    name: string | null;
    email: string | null;
    phoneNumber: string | null;
    profileURL: string | null;
    passwordHash: string | null;
    providerId: string | null;
    secretKey: string;
}
