import request from 'supertest';
import nodemailerMock from 'nodemailer-mock';
import app from 'src';
import { executeQuery, MYSQLConnection } from '../src/handler/db.ts';
import { user } from './data';
import { waitForEmail } from './utils';

describe('Users API', () => {
    let payload = {};

    beforeAll(async () => {
        nodemailerMock.mock.reset();
        await executeQuery('DELETE FROM users');
        await executeQuery('DELETE FROM verifications');
        await executeQuery('ALTER TABLE users AUTO_INCREMENT = 1');
        await executeQuery('ALTER TABLE verifications AUTO_INCREMENT = 1');
    });

    afterAll(async () => {
        await MYSQLConnection.closePool();
    });

    test('Create user', async () => {
        let response = await request(app).post('/v1/user/create').send(payload);
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual(
            'Either password or providerId is required'
        );

        payload = {
            password: user.password,
        };
        response = await request(app).post('/v1/user/create').send(payload);
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual('Email is required');

        payload = {
            email: user.name,
            password: user.password,
        };
        response = await request(app).post('/v1/user/create').send(payload);
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual('Email must be valid');

        payload = {
            email: user.email,
            password: user.password,
        };
        response = await request(app).post('/v1/user/create').send(payload);
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual('Name is required');

        payload = {
            email: user.email,
            name: user.name,
            password: user.password,
        };
        response = await request(app).post('/v1/user/create').send(payload);
        expect(response.status).toBe(200);
    }, 10000);

    test('Login user', async () => {
        payload = {};
        let response = await request(app).post('/v1/user/login').send(payload);
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual('Password is required');

        payload = {
            password: user.password,
        };
        response = await request(app).post('/v1/user/login').send(payload);
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual('Email is required');

        payload = {
            email: user.email,
            password: user.name,
        };
        response = await request(app).post('/v1/user/login').send(payload);
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual('Invalid credentials');

        payload = {
            email: user.email,
            password: user.password,
        };
        response = await request(app).post('/v1/user/login').send(payload);
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual('Account not verified');

        // After email verification
        const verificationEmail = await waitForEmail();
        const verificationToken = (verificationEmail.html as string)!.match(
            /verify\?token=([^\s].*)" class/
        )![1];

        response = await request(app)
            .get('/v1/user/verify')
            .set('Authorization', `Bearer ${verificationToken}`)
            .send();
        expect(response.status).toBe(200);
        expect(response.body.message).toEqual('Account verified');

        response = await request(app).post('/v1/user/login').send(payload);
        expect(response.status).toBe(200);
        expect(response.body.data.accessToken).not.toBeNull();
        expect(response.body.data.refreshToken).not.toBeNull();
    }, 10000);

    test('Forgot and Change password', async () => {
        payload = {};
        let response = await request(app)
            .post('/v1/user/request-reset-password')
            .send(payload);
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual('Email is required');

        payload = {
            email: user.email,
        };
        response = await request(app)
            .post('/v1/user/request-reset-password')
            .send(payload);
        expect(response.status).toBe(200);
        expect(response.body.message).toEqual('Mail sent successfully!');

        const resetLinkEmail = await waitForEmail();

        const resetToken = (resetLinkEmail.html as string)!.match(
            /reset-password\?token=(.*)" class/
        )![1];

        payload = {};
        response = await request(app)
            .post('/v1/user/change-password')
            .set('Authorization', `Bearer ${resetToken}`)
            .send(payload);
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual('Password is required');

        payload = {
            password: user.password,
        };
        response = await request(app)
            .post('/v1/user/change-password')
            .set('Authorization', `Bearer ${resetToken}`)
            .send(payload);
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual(
            'New password cannot be the same as the old password'
        );

        payload = {
            password: user.newPassword,
        };
        response = await request(app)
            .post('/v1/user/change-password')
            .set('Authorization', `Bearer ${resetToken}`)
            .send(payload);
        expect(response.status).toBe(200);
        expect(response.body.message).toEqual('Password changed successfully');

        payload = {
            email: user.email,
            password: user.password,
        };
        response = await request(app).post('/v1/user/login').send(payload);
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual('Invalid credentials');
    }, 10000);

    test('Login and get profile', async () => {
        payload = {
            email: user.email,
            password: user.newPassword,
        };
        let response = await request(app).post('/v1/user/login').send(payload);
        expect(response.status).toBe(200);
        expect(response.body.data.accessToken).not.toBeNull();
        expect(response.body.data.refreshToken).not.toBeNull();
        const accessToken = response.body.data.accessToken;
        const refreshToken = response.body.data.refreshToken;

        response = await request(app).get('/v1/user/profile').send();
        expect(response.status).toBe(401);
        expect(response.body.message).toEqual('Unauthorized');

        const cookies = `accessToken=${accessToken};refreshToken=${refreshToken}`;

        response = await request(app)
            .get('/v1/user/profile')
            .set('Cookie', cookies)
            .send();
        expect(response.status).toBe(200);
        expect(response.body.data.user.userId).not.toBeNull();
        expect(response.body.data.user.email).toEqual(user.email);
    }, 10000);
});
