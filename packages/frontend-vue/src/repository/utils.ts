export const encrypt = async (data: ILargeRecord) => {
    if (window.encryptionKey) {
        const binaryString = atob(window.encryptionKey);
        const binaryData = Uint8Array.from(binaryString, (char) =>
            char.charCodeAt(0)
        );

        const publicKey = await window.crypto.subtle.importKey(
            'spki',
            binaryData,
            {
                name: 'RSA-OAEP',
                hash: 'SHA-256',
            },
            false,
            ['encrypt']
        );

        const encoder = new TextEncoder();
        const encodedData = encoder.encode(JSON.stringify(data));

        try {
            const encryptedData = await window.crypto.subtle.encrypt(
                { name: 'RSA-OAEP' },
                publicKey,
                encodedData
            );
            const encryptedBase64 = btoa(
                String.fromCharCode(...new Uint8Array(encryptedData))
            );

            return encryptedBase64;
        } catch {
            return '';
        }
    }
    return data;
};
