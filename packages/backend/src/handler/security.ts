//
import { generateClientId } from '../../src/utils';
import { createError } from './error';
import { IMiddleWare } from './middleware';

//
import { addKeyPairRepo, getKeysRepo } from '../../src/repository/security';
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

    const clientId = generateClientId();
    const createdAt = Date.now();

    const privateKeyString = btoa(
        String.fromCharCode(...new Uint8Array(privateKey))
    );
    const publicKeyString = btoa(
        String.fromCharCode(...new Uint8Array(publicKey))
    );
    await addKeyPairRepo({
        clientId,
        publicKey: publicKeyString,
        privateKey: privateKeyString,
        createdAt: createdAt.toString(),
    });

    userKeys[clientId] = { publicKey, privateKey, createdAt };

    res.cookie('clientId', clientId, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: +process.env.KEY_ROTATION_INTERVAL!,
    });
    res.status(200).json({
        publicKey: publicKeyString,
    });
};

export const getPrivateKey = async (clientId: string) => {
    if (!userKeys[clientId]?.privateKey) {
        const { publicKey, privateKey, createdAt } =
            await getKeysRepo(clientId);
        userKeys[clientId] = {
            publicKey: Uint8Array.from(Buffer.from(publicKey, 'base64')),
            privateKey: Uint8Array.from(Buffer.from(privateKey, 'base64')),
            createdAt: +createdAt,
        };
    }

    const privateKey = userKeys[clientId]?.privateKey;

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
            Date.now() - userKeys[clientId]?.createdAt >
                +process.env.KEY_ROTATION_INTERVAL!
        ) {
            return next(createError(401, messages.responses.keyExpired));
        }

        const { encryptedSymmetricKey, encryptedData, iv } = req.body;

        if (!encryptedSymmetricKey || !encryptedData || !iv)
            return next(createError(400, messages.responses.invalidRequest));

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
        next(createError(401, messages.responses.keyExpired));
    }
};
