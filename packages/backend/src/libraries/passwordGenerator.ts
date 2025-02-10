import bcryptjs from 'bcryptjs';

export const generatePasswordHash: IGeneratePasswordHash = (password) => {
    return new Promise((resolve, rejected) => {
        bcryptjs.genSalt(10, (error, salt) => {
            if (error) rejected(error);
            bcryptjs.hash(password, salt, (passwordError, hash) => {
                if (passwordError) rejected(passwordError);
                resolve(hash);
            });
        });
    });
};

export const verifyPassword: IVerifyPassword = (
    requestPassword,
    dbPassword
) => {
    return new Promise((resolve) => {
        bcryptjs.compare(requestPassword, dbPassword, (error, isMatch) => {
            if (error) resolve(false);
            resolve(isMatch);
        });
    });
};

export type IGeneratePasswordHash = (password: string) => Promise<string>;

export type IVerifyPassword = (
    password: string,
    requestPassword: string
) => Promise<boolean>;
