export const encrypt = async (data: ILargeRecord) => {
    const publicKeyBase64 = localStorage.getItem('publicKey');
    if (publicKeyBase64) {
        const binaryString = atob(publicKeyBase64);
        const binaryData = Uint8Array.from(binaryString, (char) =>
            char.charCodeAt(0)
        );
        const publicKey = await window.crypto.subtle.importKey(
            'spki',
            binaryData,
            { name: 'RSA-OAEP', hash: 'SHA-256' },
            false,
            ['encrypt']
        );

        const symmetricKey = await window.crypto.subtle.generateKey(
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );

        const symmetricKeyRaw = await window.crypto.subtle.exportKey(
            'raw',
            symmetricKey
        );

        const encryptedSymmetricKey = await window.crypto.subtle.encrypt(
            { name: 'RSA-OAEP' },
            publicKey,
            symmetricKeyRaw
        );

        const encoder = new TextEncoder();
        const encodedData = encoder.encode(JSON.stringify(data));
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encryptedData = await window.crypto.subtle.encrypt(
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
