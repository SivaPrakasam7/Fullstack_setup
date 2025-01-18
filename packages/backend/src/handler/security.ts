//
import { IMiddleWare } from './middleware';

//
let privateKey: ArrayBuffer;

export const getPublicKey: IMiddleWare = async (req, res, _) => {
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
    privateKey = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
    res.status(200).json({
        publicKey: Buffer.from(publicKey).toString('base64'),
    });
};

export const getPrivateKey = async () => {
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
        const privateKeyObject = await getPrivateKey();

        const decryptedData = await decryptData(
            privateKeyObject,
            req.body.encryptedData
        );

        req.body = JSON.parse(decryptedData);

        next();
    } catch {
        next();
    }
};
