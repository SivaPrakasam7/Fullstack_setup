//
import { generateId } from '../../src/utils';
import { createError } from './error';
import { IMiddleWare } from './middleware';
import { getKeysRepo } from '../../src/repository/security';

//
import messages from '../utils/messages';

//
(global as any).userKeys = {};

export const clientHandler: IMiddleWare = async (req, res, next) => {
    if (req.cookies.browserId) return next();

    const browserId = `BRWS-${generateId()}`;

    res.cookie('browserId', browserId, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: +process.env.KEY_ROTATION_INTERVAL!,
    });

    next();
};

export const getPrivateKey = async (clientId: string) => {
    if (!(global as any).userKeys[clientId]) {
        const { publicKey, privateKey, createdAt } =
            await getKeysRepo(clientId);
        (global as any).userKeys[clientId] = {
            publicKey: Uint8Array.from(Buffer.from(publicKey, 'base64')),
            privateKey: Uint8Array.from(Buffer.from(privateKey, 'base64')),
            createdAt: +createdAt,
        };
    }

    const privateKey = (global as any).userKeys[clientId]?.privateKey;

    if (!privateKey) return;

    const privateKeyObject = await crypto.subtle.importKey(
        'pkcs8',
        privateKey,
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        false,
        ['decrypt']
    );

    return privateKeyObject;
};

export const decryptPayload: IMiddleWare = async (req, _, next) => {
    try {
        if (
            req.method === 'GET' ||
            req.headers['content-type']?.includes('multipart/form-data')
        )
            return next();

        const clientId = req.cookies.clientId;
        const privateKey = await getPrivateKey(clientId);

        if (
            !clientId ||
            !privateKey ||
            Date.now() - (global as any).userKeys[clientId]?.createdAt >
                +process.env.KEY_ROTATION_INTERVAL!
        ) {
            return next(createError(403, messages.responses.keyExpired));
        }

        const { encryptedSymmetricKey, encryptedData, iv } = req.body;

        if (!encryptedSymmetricKey || !encryptedData || !iv)
            return next(createError(403, messages.responses.keyExpired));

        const symmetricKeyRaw = await crypto.subtle.decrypt(
            { name: 'RSA-OAEP' },
            privateKey,
            Uint8Array.from(Buffer.from(encryptedSymmetricKey, 'base64'))
        );

        const symmetricKey = await crypto.subtle.importKey(
            'raw',
            symmetricKeyRaw,
            { name: 'AES-GCM' },
            false,
            ['decrypt']
        );

        const decryptedData = await crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: Uint8Array.from(Buffer.from(iv, 'base64')),
            },
            symmetricKey,
            Uint8Array.from(Buffer.from(encryptedData, 'base64'))
        );

        req.body = JSON.parse(new TextDecoder().decode(decryptedData));
        next();
    } catch {
        next(createError(403, messages.responses.keyExpired));
    }
};
