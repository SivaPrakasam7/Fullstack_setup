/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt from 'jsonwebtoken';

//
export const verifyToken: IVerifyToken = (token: string) => {
    return new Promise((resolve, reject) => {
        jwt.verify(
            token,
            process.env.SECRET_KEY!,
            async (err, payload: any) => {
                if (err) reject(err);
                resolve(payload);
            }
        );
    });
};

export const generateTokenByRefreshToken: IGenerateRefreshToken = (token) => {
    return new Promise((resolve) => {
        verifyToken(token).then((result) => {
            const token = generateToken({
                ...result,
            });
            resolve(token);
        });
    });
};

export const generateToken: IGenerateToken = (data, verification = false) => {
    const { exp: _, iat: __, ...payload } = data;
    const token = jwt.sign(payload, process.env.SECRET_KEY!, {
        expiresIn: verification
            ? +process.env.EXPIRES_IN!
            : +process.env.REFRESH_TOKEN_EXPIRES_IN!,
    });
    return token;
};

export type IVerifyToken = (token: string) => Promise<Record<string, any>>;

export type IGenerateToken = (
    data: Record<string, any>,
    verification?: boolean
) => string;

export type IGenerateRefreshToken = (token: string) => Promise<string>;
