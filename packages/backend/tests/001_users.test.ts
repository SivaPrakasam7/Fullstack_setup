import request from 'supertest';
import nodemailerMock from 'nodemailer-mock';
import app from 'src';
import { executeQuery, MYSQLConnection } from '../src/handler/db.ts';
import { user } from './data';
import { encrypt, waitForEmail } from './utils';

let clientId: string;
let storedPublicKey: string;
let accessToken: string = '';
let refreshToken: string = '';
let cookies: string = '';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let userDetail: Record<string, string> = {};

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
            .send(await encrypt(payload, storedPublicKey));
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
            .send(await encrypt(payload, storedPublicKey));
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
            .send(await encrypt(payload, storedPublicKey));
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual('Email must be valid');

        payload = {
            name: user.name,
            password: user.password,
        };
        response = await request(app)
            .post('/v1/user/create')
            .set('Cookie', `clientId=${clientId}`)
            .send(await encrypt(payload, storedPublicKey));
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
            .send(await encrypt(payload, storedPublicKey));
        expect(response.status).toBe(200);
    }, 10000);

    test('Login user', async () => {
        payload = {};
        let response = await request(app)
            .post('/v1/user/login')
            .set('Cookie', `clientId=${clientId}`)
            .send(await encrypt(payload, storedPublicKey));
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual('Password is required');

        payload = {
            password: user.password,
        };
        response = await request(app)
            .post('/v1/user/login')
            .set('Cookie', `clientId=${clientId}`)
            .send(await encrypt(payload, storedPublicKey));
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual('Email is required');

        payload = {
            email: user.email,
            password: user.name,
        };
        response = await request(app)
            .post('/v1/user/login')
            .set('Cookie', `clientId=${clientId}`)
            .send(await encrypt(payload, storedPublicKey));
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
            .send(await encrypt(payload, storedPublicKey));
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
            .send(await encrypt(payload, storedPublicKey));
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
            .send(await encrypt(payload, storedPublicKey));
        expect(response.status).toBe(200);
        expect(response.body.data.accessToken).not.toBeNull();
        expect(response.body.data.refreshToken).not.toBeNull();
    }, 10000);

    test('Forgot and Change password', async () => {
        payload = {};
        let response = await request(app)
            .post('/v1/user/request-reset-password')
            .set('Cookie', `clientId=${clientId}`)
            .send(await encrypt(payload, storedPublicKey));
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual('Email is required');

        payload = {
            email: user.email,
        };
        response = await request(app)
            .post('/v1/user/request-reset-password')
            .set('Cookie', `clientId=${clientId}`)
            .send(await encrypt(payload, storedPublicKey));
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
            .send(await encrypt(payload, storedPublicKey));
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual('Password is required');

        payload = {
            password: user.password,
        };
        response = await request(app)
            .post('/v1/user/change-password')
            .set('Cookie', `clientId=${clientId}`)
            .set('Authorization', `Bearer ${resetToken}`)
            .send(await encrypt(payload, storedPublicKey));
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
            .send(await encrypt(payload, storedPublicKey));
        expect(response.status).toBe(200);
        expect(response.body.message).toEqual('Password updated successfully');

        payload = {
            email: user.email,
            password: user.password,
        };
        response = await request(app)
            .post('/v1/user/login')
            .set('Cookie', `clientId=${clientId}`)
            .send(await encrypt(payload, storedPublicKey));
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
            .send(await encrypt(payload, storedPublicKey));
        expect(response.status).toBe(200);
        expect(response.body.data.accessToken).not.toBeNull();
        expect(response.body.data.refreshToken).not.toBeNull();
        accessToken = response.body.data.accessToken;
        refreshToken = response.body.data.refreshToken;

        response = await request(app)
            .get('/v1/user/profile')
            .set('Cookie', `clientId=${clientId}`)
            .send();
        expect(response.status).toBe(401);
        expect(response.body.message).toEqual(
            'You do not have permission to perform this action'
        );

        cookies = `clientId=${clientId};accessToken=${accessToken};refreshToken=${refreshToken}`;

        response = await request(app)
            .get('/v1/user/profile')
            .set('Cookie', cookies)
            .send();
        expect(response.status).toBe(200);
        userDetail = response.body.data.user;
        expect(response.body.data.user.userId).not.toBeNull();
        expect(response.body.data.user.email).toEqual(user.email);
    }, 10000);

    test('Login, Update profile', async () => {
        payload = {
            name: user.newName,
        };

        let response = await request(app)
            .put('/v1/user/update')
            .set('Cookie', `clientId=${clientId}`)
            .send(await encrypt(payload, storedPublicKey));
        expect(response.status).toBe(401);
        expect(response.body.message).toEqual(
            'You do not have permission to perform this action'
        );

        response = await request(app)
            .put('/v1/user/update')
            .set('Cookie', cookies)
            .send(await encrypt(payload, storedPublicKey));
        expect(response.status).toBe(200);
        expect(response.body.message).toEqual(
            'User details updated successfully'
        );
    }, 10000);

    test('Login and Update password', async () => {
        payload = {};

        let response = await request(app)
            .put('/v1/user/update-password')
            .set('Cookie', `clientId=${clientId}`)
            .send(await encrypt(payload, storedPublicKey));
        expect(response.status).toBe(401);
        expect(response.body.message).toEqual(
            'You do not have permission to perform this action'
        );

        response = await request(app)
            .put('/v1/user/update-password')
            .set('Cookie', cookies)
            .send(await encrypt(payload, storedPublicKey));
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual('Current password is required');

        payload = {
            currentPassword: user.newPassword,
        };

        response = await request(app)
            .put('/v1/user/update-password')
            .set('Cookie', cookies)
            .send(await encrypt(payload, storedPublicKey));
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual('Password is required');

        payload = {
            currentPassword: user.password,
            password: user.newPassword,
        };

        response = await request(app)
            .put('/v1/user/update-password')
            .set('Cookie', cookies)
            .send(await encrypt(payload, storedPublicKey));
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual(
            'Passwords do not match. Please try again'
        );

        payload = {
            currentPassword: user.newPassword,
            password: user.password,
        };

        response = await request(app)
            .put('/v1/user/update-password')
            .set('Cookie', cookies)
            .send(await encrypt(payload, storedPublicKey));
        expect(response.status).toBe(200);
        expect(response.body.message).toEqual('Password updated successfully');
    }, 10000);
});
