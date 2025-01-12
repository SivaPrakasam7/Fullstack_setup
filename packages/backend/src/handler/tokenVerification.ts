import { Response } from 'express';

//
import { IMiddleWare } from 'src/handler/middleware';
// import { getAuth } from 'src/libraries/firebase';
import { generateToken, verifyToken } from 'src/libraries/tokenGenerator';
import { createError } from 'src/handler/error';

//
import messages from 'src/utils/messages.json';
import { getUserByIDandSecretKeyRepo } from 'src/repository/user';

//
const clearCookies = (res: Response) => {
    res.cookie('refreshToken', '', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
    });
    res.cookie('accessToken', '', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
    });
};

export const tokenChecker: IMiddleWare = async (
    req,
    res,
    next,
    optional = false
) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        const accessToken = req.cookies.accessToken;

        if (!optional && !refreshToken && !accessToken) {
            clearCookies(res);
            return next(createError(401, messages.responses.unauthorized));
        }

        let result;
        try {
            result = await verifyToken(accessToken);
        } catch {
            if (refreshToken || optional) {
                result = await verifyToken(refreshToken);

                const payload = JSON.parse(atob(accessToken.split('.')?.[1]));

                const now = Date.now();

                if (
                    now - payload.lastUsed <=
                    +process.env.REFRESH_TOKEN_EXPIRES_IN!
                ) {
                    const newAccessTokenToken = await generateToken(
                        { ...result, lastUsed: now },
                        true
                    );
                    res.cookie('accessToken', newAccessTokenToken, {
                        httpOnly: true,
                        secure: true,
                        sameSite: 'strict',
                        maxAge: +process.env.REFRESH_TOKEN_EXPIRES_IN!,
                    });
                } else {
                    clearCookies(res);
                    return next(
                        createError(401, messages.responses.unauthorized)
                    );
                }
            }
        }

        const {
            iat: _,
            exp: __,
            lastUsed: ___,
            ...data
        } = result as Record<string, string>;

        if (data.secretKey) {
            const isUserAvailable = await getUserByIDandSecretKeyRepo(
                data.userId,
                data.secretKey
            );

            if (!isUserAvailable) {
                clearCookies(res);
                return next(createError(401, messages.responses.unauthorized));
            }
        }

        req.body = {
            ...data,
            ...req.body,
        };

        next();
    } catch {
        if (optional) return next();
        else {
            clearCookies(res);
            return next(createError(401, messages.responses.unauthorized));
        }
    }
};

//
export const headerTokenChecker: IMiddleWare = async (req, _, next) => {
    try {
        const token = req.headers.authorization?.split(' ')?.[1];
        if (!token) throw createError(401, messages.responses.unauthorized);

        const result = await verifyToken(token);

        req.body = {
            ...result,
            ...req.body,
        };

        next();
    } catch {
        return next(createError(401, messages.responses.unauthorized));
    }
};

// export const providerTokenChecker: IMiddleWare = async (req, _, next) => {
//     const requestToken = req.headers.authorization?.split(' ')?.[1];

//     if (!requestToken) throw createError(400, messages.responses.tokenNotFound);

//     await getAuth()
//         .verifyIdToken(requestToken)
//         .then((decodedToken) => {
//             const providerId = decodedToken.uid;
//             const name = decodedToken.name;
//             const email = decodedToken.email;

//             req.body = {
//                 ...{
//                     providerId,
//                     name,
//                     email,
//                 },
//                 ...req.body,
//             };

//             next();
//         });
// };
