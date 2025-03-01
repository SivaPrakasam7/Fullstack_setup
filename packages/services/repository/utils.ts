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

export const calculateFileChecksum = (file: File) => {
    const fileReader = new FileReader();

    return new Promise((resolve, reject) => {
        fileReader.onload = async (event) => {
            try {
                const fileArrayBuffer = event.target!.result as ArrayBuffer;

                const hashBuffer = await crypto.subtle.digest(
                    'SHA-256',
                    fileArrayBuffer
                );

                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const hashHex = hashArray
                    .map((byte) => byte.toString(16).padStart(2, '0'))
                    .join('');

                resolve(hashHex);
            } catch (error) {
                reject('Error calculating checksum: ' + error);
            }
        };

        fileReader.readAsArrayBuffer(file);
    });
};

export const byteFormat = (bytes: number, decimals: number) => {
    if (!+bytes) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export const formatAcceptTypes = (accept: string): string => {
    const mimeMap: { [key: string]: string } = {
        'image/jpeg': 'JPEG',
        'image/png': 'PNG',
        'image/gif': 'GIF',
        'application/pdf': 'PDF',
    };
    return accept
        .split(',')
        .map(
            (mime) => mimeMap[mime] || mime.split('/')[1]?.toUpperCase() || mime
        )
        .join(', ');
};

export const generateKey = () => {
    return Math.random().toString(36).substring(2, 12);
};
