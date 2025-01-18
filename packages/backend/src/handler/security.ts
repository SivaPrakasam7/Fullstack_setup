//
import { generateClientId } from '../../src/utils';
import { createError } from './error';
import { IMiddleWare } from './middleware';

//
import messages from '../utils/messages';

//
const userKeys: Record<
    string,
    { publicKey: ArrayBuffer; privateKey: ArrayBuffer; createdAt: number }
> = {};

export const getPublicKey: IMiddleWare = async (__, res, _) => {
    const keyPair = await crypto.subtle.generateKey(
        {
            name: 'RSA-OAEP',
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: 'SHA-256',
        },
        true,
        ['encrypt', 'decrypt']
    );

    const publicKey = await crypto.subtle.exportKey('spki', keyPair.publicKey);
    const privateKey = await crypto.subtle.exportKey(
        'pkcs8',
        keyPair.privateKey
    );

    const newClientId = generateClientId();

    userKeys[newClientId] = { publicKey, privateKey, createdAt: Date.now() };

    res.cookie('clientId', newClientId, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: +process.env.KEY_ROTATION_INTERVAL!,
    });
    res.status(200).json({
        publicKey: Buffer.from(publicKey).toString('base64'),
    });
};

export const getPrivateKey = async (privateKey: ArrayBuffer) => {
    const privateKeyObject = await crypto.subtle.importKey(
        'pkcs8',
        privateKey,
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        false,
        ['decrypt']
    );

    return privateKeyObject;
};

export const decryptData = async (
    privateKey: CryptoKey,
    encryptedDataBase64: string
) => {
    const encryptedData = Uint8Array.from(
        Buffer.from(encryptedDataBase64, 'base64')
    );

    const decryptedData = await crypto.subtle.decrypt(
        { name: 'RSA-OAEP' },
        privateKey,
        encryptedData
    );

    return new TextDecoder().decode(decryptedData);
};

export const decryptPayload: IMiddleWare = async (req, _, next) => {
    try {
        const clientId = req.cookies.clientId;

        if (req.path.includes('publicKey')) return next();

        if (
            !userKeys[clientId] ||
            Date.now() - userKeys[clientId]?.createdAt >
                +process.env.KEY_ROTATION_INTERVAL!
        ) {
            return next(createError(401, messages.responses.keyExpired));
        }

        if (req.body.encryptedData) {
            const privateKey = userKeys[clientId].privateKey;
            const privateKeyObject = await getPrivateKey(privateKey);

            const decryptedData = await decryptData(
                privateKeyObject,
                req.body.encryptedData
            );

            req.body = JSON.parse(decryptedData);
        }
        next();
    } catch {
        next(createError(401, messages.responses.keyExpired));
    }
};
