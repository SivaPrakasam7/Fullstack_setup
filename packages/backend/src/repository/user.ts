import { executeQuery } from '../../src/handler/db.ts';

//
export const getUserByIDandSecretKeyRepo = async (
    userId: string,
    secretKey: string
) => {
    const query = `SELECT * FROM users WHERE userId=? AND secretKey=? AND isDeleted=0`;

    const queryResponse = await executeQuery(query, [userId, secretKey]);

    return queryResponse[0];
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
    const query = `INSERT INTO users (userId, name, email, phoneNumber, profileURL, passwordHash, providerId, secretKey) VALUES(?, ?, ?, ?, ?, ?, ?, ?)`;

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

    return queryResponse.insertId;
};

export const updateEmailVerification = async (email: string) => {
    const query = `INSERT INTO verifications (source) VALUES (?)`;

    const queryResponse = await executeQuery(query, [email]);

    return queryResponse.affectedRows;
};

export const updateVerificationOTP = async (
    phoneNumber: string,
    otp: string
) => {
    const query = `INSERT INTO verifications (source, code) VALUES (?, ?) ON DUPLICATE KEY UPDATE code = VALUES(code)`;

    const queryResponse = await executeQuery(query, [phoneNumber, otp]);

    return queryResponse.affectedRows;
};

export const updateVerificationRepo = async (
    source: string,
    type: 'email' | 'phone',
    otp?: string
) => {
    if (type === 'email') {
        const query = `UPDATE verifications SET verified=1 WHERE source=?`;

        const queryResponse = await executeQuery(query, [source]);

        return queryResponse.affectedRows;
    } else if (type === 'phone') {
        const query = `UPDATE verifications SET verified=1, code='' WHERE source=? AND code=?`;

        const queryResponse = await executeQuery(query, [source, otp]);

        return queryResponse.affectedRows;
    }
};

export const getUserBySourceRepo = async ({
    email,
    phoneNumber,
}: {
    email?: string;
    phoneNumber?: string;
}) => {
    if (email) {
        const query = `SELECT * FROM users WHERE email=? AND status='active' AND isDeleted=0`;

        const queryResponse = await executeQuery(query, [email]);

        return queryResponse[0];
    } else {
        const query = `SELECT * FROM users WHERE phoneNumber=? AND status='active' AND isDeleted=0`;

        const queryResponse = await executeQuery(query, [phoneNumber]);

        return queryResponse[0];
    }
};

export const checkUserVerifiedRepo = async (source: string) => {
    const query = `SELECT count(*) AS count FROM verifications WHERE source=? AND verified=1 AND isDeleted=0`;

    const queryResponse = await executeQuery(query, [source]);

    return queryResponse[0].count;
};

export const getUserByIdRepo = async (userId: string) => {
    const query = `SELECT userId, name, email, phoneNumber, profileURL FROM users WHERE userId=? AND status='active' AND isDeleted=0`;

    const queryResponse = await executeQuery(query, [userId]);

    return queryResponse[0];
};

export const getLocalUserByIdRepo = async (userId: string) => {
    const query = `SELECT * FROM users WHERE userId=? AND status='active' AND isDeleted=0`;

    const queryResponse = await executeQuery(query, [userId]);

    return queryResponse[0];
};

export const updateResetPasswordKeyRepo = async (
    resetPasswordKey: string,
    userId: string
) => {
    const query = `UPDATE users SET resetPasswordKey=? WHERE userId=? AND isDeleted=0`;

    const queryResponse = await executeQuery(query, [resetPasswordKey, userId]);

    return queryResponse.affectedRows;
};

export const updatePasswordByKeyRepo = async (
    passwordHash: string,
    userId: string,
    secretKey: string,
    resetPasswordKey: string
) => {
    const query = `UPDATE users SET passwordHash=?, secretKey=?, resetPasswordKey='' WHERE userId=? AND resetPasswordKey=?  AND isDeleted=0`;

    const queryResponse = await executeQuery(query, [
        passwordHash,
        secretKey,
        userId,
        resetPasswordKey,
    ]);

    return queryResponse.affectedRows;
};

export const updatePasswordRepo = async (
    passwordHash: string,
    userId: string
) => {
    const query = `UPDATE users SET passwordHash=? WHERE userId=? AND isDeleted=0`;

    const queryResponse = await executeQuery(query, [passwordHash, userId]);

    return queryResponse.affectedRows;
};

export const increaseFailedAttemptRepo = async (userId: string) => {
    const query = `UPDATE users SET failedAttempts = failedAttempts+1, isSuspended = CASE WHEN failedAttempts >= 3 THEN 1 ELSE 0 END, suspendedAt = CASE WHEN failedAttempts >= 3 THEN CURRENT_TIMESTAMP ELSE NULL END WHERE userId=? AND isDeleted=0`;

    const queryResponse = await executeQuery(query, [userId]);

    return queryResponse.affectedRows;
};

export const updateUserRepo = async (userId: string, user: Partial<IUser>) => {
    const query = `UPDATE users SET ${Object.entries(user)
        .map(
            ([key, value]) =>
                `${key}=${key === 'lastLoginTime' ? 'CURRENT_TIMESTAMP' : `'${value}'`}`
        )
        .join(', ')} WHERE userId='${userId}' AND isDeleted=0`;

    const queryResponse = await executeQuery(query, []);

    return queryResponse.affectedRows;
};

export const updateSecretKeyRepo = async (
    secretKey: string,
    userId: string
) => {
    const query = `UPDATE users SET secretKey=? WHERE userId=? AND isDeleted=0`;

    const queryResponse = await executeQuery(query, [secretKey, userId]);

    return queryResponse.affectedRows;
};

//
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
