import { generateSecretKey } from '../../src/utils';
import { IService } from '../../src/handler/middleware';
import {
    addKeyPairRepo,
    getKeysByUserIdRepo,
    getKeysRepo,
} from '../../src/repository/security';
import { createError } from '../../src/handler/error';

//
import messages from '../../src/utils/messages';

//
export const getKeyPairService: IService<any> = async (data) => {
    let clientId = data.browserId;
    const userId = data.userId || null;

    if (clientId && !userId) {
        if (!(global as any).userKeys[clientId]) {
            const keyPair = await getKeysRepo(clientId);
            if (keyPair)
                (global as any).userKeys[clientId] = {
                    publicKey: Uint8Array.from(
                        Buffer.from(keyPair.publicKey, 'base64')
                    ),
                    privateKey: Uint8Array.from(
                        Buffer.from(keyPair.privateKey, 'base64')
                    ),
                    createdAt: +keyPair.createdAt,
                };
        }
    } else if (userId) {
        (global as any).userKeys[clientId] = null;
        const keyPair = await getKeysByUserIdRepo(userId);
        if (keyPair) {
            clientId = keyPair.clientId;
            (global as any).userKeys[clientId] = {
                publicKey: Uint8Array.from(
                    Buffer.from(keyPair.publicKey, 'base64')
                ),
                privateKey: Uint8Array.from(
                    Buffer.from(keyPair.privateKey, 'base64')
                ),
                createdAt: +keyPair.createdAt,
            };
        }
    }

    if ((global as any).userKeys[clientId]) {
        const keyPair = (global as any).userKeys[clientId];

        const publicKeyString = btoa(
            String.fromCharCode(...new Uint8Array(keyPair.publicKey))
        );
        const privateKeyString = btoa(
            String.fromCharCode(...new Uint8Array(keyPair.privateKey))
        );

        return {
            clientId,
            publicKey: publicKeyString,
            privateKey: privateKeyString,
        };
    }

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

    clientId = data.userId ? `CLNT-${generateSecretKey()}` : data.browserId;

    const createdAt = Date.now();

    const privateKeyString = btoa(
        String.fromCharCode(...new Uint8Array(privateKey))
    );
    const publicKeyString = btoa(
        String.fromCharCode(...new Uint8Array(publicKey))
    );
    await addKeyPairRepo({
        clientId,
        userId,
        publicKey: publicKeyString,
        privateKey: privateKeyString,
        createdAt: createdAt.toString(),
    });

    (global as any).userKeys[clientId] = { publicKey, privateKey, createdAt };

    return {
        clientId,
        publicKey: publicKeyString,
        privateKey: privateKeyString,
    };
};

export const getClientPublicKeyService: IService<string> = async (data) => {
    const result = await getKeysRepo(data.clientId);

    if (!result) throw createError(404, messages.responses.notFound);

    return result.publicKey;
};

// Utils
export const getPrivateKey = async (clientId: string) => {
    if (!(global as any).userKeys[clientId]?.privateKey) {
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
