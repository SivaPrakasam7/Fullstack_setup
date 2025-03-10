import nodemailerMock from 'nodemailer-mock';
import Mail from 'nodemailer/lib/mailer';

export const waitForEmail = (interval = 1000): Promise<Mail.Options> => {
    return new Promise((resolve) => {
        const checkMail = () => {
            const sentEmails = nodemailerMock.mock.getSentMail();
            const mail = sentEmails[0];
            if (mail) {
                nodemailerMock.mock.reset();
                resolve(mail);
            } else {
                setTimeout(checkMail, interval);
            }
        };

        checkMail();
    });
};

export const encrypt = async (
    data: Record<string, string>,
    storedPublicKey: string
) => {
    if (storedPublicKey) {
        const binaryString = atob(storedPublicKey);
        const binaryData = Uint8Array.from(binaryString, (char) =>
            char.charCodeAt(0)
        );
        const publicKey = await crypto.subtle.importKey(
            'spki',
            binaryData,
            { name: 'RSA-OAEP', hash: 'SHA-256' },
            false,
            ['encrypt']
        );

        const symmetricKey = await crypto.subtle.generateKey(
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );

        const symmetricKeyRaw = await crypto.subtle.exportKey(
            'raw',
            symmetricKey
        );

        const encryptedSymmetricKey = await crypto.subtle.encrypt(
            { name: 'RSA-OAEP' },
            publicKey,
            symmetricKeyRaw
        );

        const encoder = new TextEncoder();
        const encodedData = encoder.encode(JSON.stringify(data));
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encryptedData = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            symmetricKey,
            encodedData
        );

        const encryptedSymmetricKeyBase64 = btoa(
            String.fromCharCode(...new Uint8Array(encryptedSymmetricKey))
        );
        const encryptedDataBase64 = btoa(
            String.fromCharCode(...new Uint8Array(encryptedData))
        );
        const ivBase64 = btoa(String.fromCharCode(...iv));

        return {
            encryptedSymmetricKey: encryptedSymmetricKeyBase64,
            encryptedData: encryptedDataBase64,
            iv: ivBase64,
        };
    }
    return data;
};
