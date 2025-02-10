import request from 'supertest';
import nodemailerMock from 'nodemailer-mock';
import app from 'src';
import { executeQuery, MYSQLConnection } from '../src/handler/db.ts';
import { user } from './data';
import { waitForEmail } from './utils';

let clientId: string;
let storedPublicKey: string;

export const encrypt = async (data: Record<string, string>) => {
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

describe('Users API', () => {
    let payload = {};

    beforeAll(async () => {
        nodemailerMock.mock.reset();
        await executeQuery('DELETE FROM users');
        await executeQuery('DELETE FROM verifications');
        await executeQuery('ALTER TABLE users AUTO_INCREMENT = 1');
        await executeQuery('ALTER TABLE verifications AUTO_INCREMENT = 1');

        // Fetch public key and set clientId
        const response = await request(app).get('/v1/security/keyPair').send();
        expect(response.status).toBe(200);
        clientId =
            (response.headers['set-cookie'] as unknown as string[])
                .find((cookie: string) => cookie.startsWith('clientId='))
                ?.split('=')[1]
                ?.split(';')[0] || '';
        expect(clientId).not.toBeNull();
        storedPublicKey = response.body.publicKey;
        expect(storedPublicKey).not.toBeNull();
    });

    afterAll(async () => {
        await MYSQLConnection.closePool();
    });

    test('Create user', async () => {
        let response = await request(app)
            .post('/v1/user/create')
            .set('Cookie', `clientId=${clientId}`)
            .send(await encrypt(payload));
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual(
            'Either password or providerId is required'
        );

        payload = {
            password: user.password,
        };
        response = await request(app)
            .post('/v1/user/create')
            .set('Cookie', `clientId=${clientId}`)
            .send(await encrypt(payload));
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual('Name is required');

        payload = {
            name: user.name,
            email: user.name,
            password: user.password,
        };
        response = await request(app)
            .post('/v1/user/create')
            .set('Cookie', `clientId=${clientId}`)
            .send(await encrypt(payload));
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual('Email must be valid');

        payload = {
            name: user.name,
            password: user.password,
        };
        response = await request(app)
            .post('/v1/user/create')
            .set('Cookie', `clientId=${clientId}`)
            .send(await encrypt(payload));
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual('Email is required');

        payload = {
            email: user.email,
            name: user.name,
            password: user.password,
        };
        response = await request(app)
            .post('/v1/user/create')
            .set('Cookie', `clientId=${clientId}`)
            .send(await encrypt(payload));
        expect(response.status).toBe(200);
    }, 10000);

    test('Login user', async () => {
        payload = {};
        let response = await request(app)
            .post('/v1/user/login')
            .set('Cookie', `clientId=${clientId}`)
            .send(await encrypt(payload));
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual('Password is required');

        payload = {
            password: user.password,
        };
        response = await request(app)
            .post('/v1/user/login')
            .set('Cookie', `clientId=${clientId}`)
            .send(await encrypt(payload));
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual('Email is required');

        payload = {
            email: user.email,
            password: user.name,
        };
        response = await request(app)
            .post('/v1/user/login')
            .set('Cookie', `clientId=${clientId}`)
            .send(await encrypt(payload));
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual(
            'Invalid credentials. Please check and try again'
        );

        payload = {
            email: user.email,
            password: user.password,
        };
        response = await request(app)
            .post('/v1/user/login')
            .set('Cookie', `clientId=${clientId}`)
            .send(await encrypt(payload));
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual(
            'Your account has not been verified'
        );

        payload = {
            email: user.email,
        };
        response = await request(app)
            .post('/v1/user/request-verification')
            .set('Cookie', `clientId=${clientId}`)
            .send(await encrypt(payload));
        expect(response.status).toBe(200);

        // After email verification
        const verificationEmail = await waitForEmail();
        const verificationToken = (verificationEmail.html as string)!.match(
            /verify\?token=([^\s].*)" class/
        )![1];

        response = await request(app)
            .get('/v1/user/verify-email')
            .set('Cookie', `clientId=${clientId}`)
            .set('Authorization', `Bearer ${verificationToken}`)
            .send();
        expect(response.status).toBe(200);
        expect(response.body.message).toEqual(
            'Your account has been successfully verified'
        );

        payload = {
            email: user.email,
            password: user.password,
        };

        response = await request(app)
            .post('/v1/user/login')
            .set('Cookie', `clientId=${clientId}`)
            .send(await encrypt(payload));
        expect(response.status).toBe(200);
        expect(response.body.data.accessToken).not.toBeNull();
        expect(response.body.data.refreshToken).not.toBeNull();
    }, 10000);

    test('Forgot and Change password', async () => {
        payload = {};
        let response = await request(app)
            .post('/v1/user/request-reset-password')
            .set('Cookie', `clientId=${clientId}`)
            .send(await encrypt(payload));
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual('Email is required');

        payload = {
            email: user.email,
        };
        response = await request(app)
            .post('/v1/user/request-reset-password')
            .set('Cookie', `clientId=${clientId}`)
            .send(await encrypt(payload));
        expect(response.status).toBe(200);
        expect(response.body.message).toEqual(
            'Email has been sent successfully!'
        );

        const resetLinkEmail = await waitForEmail();

        const resetToken = (resetLinkEmail.html as string)!.match(
            /reset-password\?token=(.*)" class/
        )![1];

        payload = {};
        response = await request(app)
            .post('/v1/user/change-password')
            .set('Cookie', `clientId=${clientId}`)
            .set('Authorization', `Bearer ${resetToken}`)
            .send(await encrypt(payload));
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual('Password is required');

        payload = {
            password: user.password,
        };
        response = await request(app)
            .post('/v1/user/change-password')
            .set('Cookie', `clientId=${clientId}`)
            .set('Authorization', `Bearer ${resetToken}`)
            .send(await encrypt(payload));
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual(
            'New password cannot be the same as the old password'
        );

        payload = {
            password: user.newPassword,
        };
        response = await request(app)
            .post('/v1/user/change-password')
            .set('Cookie', `clientId=${clientId}`)
            .set('Authorization', `Bearer ${resetToken}`)
            .send(await encrypt(payload));
        expect(response.status).toBe(200);
        expect(response.body.message).toEqual('Password updated successfully');

        payload = {
            email: user.email,
            password: user.password,
        };
        response = await request(app)
            .post('/v1/user/login')
            .set('Cookie', `clientId=${clientId}`)
            .send(await encrypt(payload));
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual(
            'Invalid credentials. Please check and try again'
        );
    }, 10000);

    test('Login and get profile', async () => {
        payload = {
            email: user.email,
            password: user.newPassword,
        };
        let response = await request(app)
            .post('/v1/user/login')
            .set('Cookie', `clientId=${clientId}`)
            .send(await encrypt(payload));
        expect(response.status).toBe(200);
        expect(response.body.data.accessToken).not.toBeNull();
        expect(response.body.data.refreshToken).not.toBeNull();
        const accessToken = response.body.data.accessToken;
        const refreshToken = response.body.data.refreshToken;

        response = await request(app)
            .get('/v1/user/profile')
            .set('Cookie', `clientId=${clientId}`)
            .send();
        expect(response.status).toBe(401);
        expect(response.body.message).toEqual(
            'You do not have permission to perform this action'
        );

        const cookies = `clientId=${clientId};accessToken=${accessToken};refreshToken=${refreshToken}`;

        response = await request(app)
            .get('/v1/user/profile')
            .set('Cookie', cookies)
            .send();
        expect(response.status).toBe(200);
        expect(response.body.data.user.userId).not.toBeNull();
        expect(response.body.data.user.email).toEqual(user.email);
    }, 10000);
});
