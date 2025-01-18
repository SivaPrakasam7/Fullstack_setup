import express from 'express';
import {
    changePasswordController,
    createUserController,
    forgotPasswordController,
    loginController,
    userController,
    requestVerifyController,
    verifyController,
    logoutController,
} from '../../src/controller/user';
import {
    headerTokenChecker,
    tokenChecker,
} from '../../src/handler/tokenVerification';
import { validator } from '../../src/handler/validator';
import {
    createUserValidation,
    forgotPasswordValidation,
    loginValidation,
    resetPasswordValidation,
} from '../../src/validations/user';

const router = express.Router();

// Create user API
/**
 * @swagger
 * /v1/user/create:
 *   post:
 *     summary: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "TestUser@mail.com"
 *                 description: "The user's email address."
 *               name:
 *                 type: string
 *                 example: "TestUser"
 *                 description: "The user's name."
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Dev@123456"
 *                 description: "The user's password."
 *             required:
 *               - email
 *               - name
 *               - password
 *     responses:
 *       200:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User created successfully."
 *                 userId:
 *                   type: integer
 *                   example: 123
 *       400:
 *         description: Bad request, validation errors
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Either password or providerId is required"
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Email is required"
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Email must be valid"
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Name is required"
 */

router
    .route('/create')
    .post(validator(createUserValidation), createUserController);

// User login API
/**
 * @swagger
 * /v1/user/login:
 *   post:
 *     summary: Log in a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "testUser@mail.com"
 *                 description: "The user's email address."
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Dev@1234567"
 *                 description: "The user's password."
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       example: "your_access_token"
 *                     refreshToken:
 *                       type: string
 *                       example: "your_refresh_token"
 *       400:
 *         description: Bad request, validation errors
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Password is required"
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Email is required"
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Invalid credentials"
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Account not verified"
 */

router.route('/login').post(validator(loginValidation), loginController);

// Get user profile API
/**
 * @swagger
 * /v1/user/profile:
 *   get:
 *     summary: Get user profile information
 *     security:
 *       - cookieAuth: []  # Assuming you are using cookies for authentication
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         userId:
 *                           type: string
 *                           example: "12345"
 *                           description: "The unique identifier for the user."
 *                         email:
 *                           type: string
 *                           format: email
 *                           example: "testUser@mail.com"
 *                           description: "The email address of the user."
 *       401:
 *         description: Unauthorized, token not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Token not found"
 */

router.route('/profile').get(tokenChecker, userController);

// Request email verification mail
/**
 * @swagger
 * /v1/user/request-verification:
 *   get:
 *     summary: Request a email verification
 *     security:
 *       - cookieAuth: []  # Assuming you are using cookies for authentication
 *     responses:
 *       200:
 *         description: Mail sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Mail sent successfully!"
 *       401:
 *         description: Unauthorized, invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 */

router.route('/request-verification').get(requestVerifyController);

// Email verification API
/**
 * @swagger
 * /v1/user/verify:
 *   get:
 *     summary: Verify user account
 *     security:
 *       - cookieAuth: []  # Assuming you are using cookies for authentication
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer token for authorization
 *         schema:
 *           type: string
 *           example: "Bearer your_verification_token"
 *     responses:
 *       200:
 *         description: Account verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Account verified"
 *       401:
 *         description: Unauthorized, invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 */

router.route('/verify').get(headerTokenChecker, verifyController);

// Generate reset password link API
/**
 * @swagger
 * /v1/user/request-reset-password:
 *   post:
 *     summary: Request a password reset
 *     security:
 *       - cookieAuth: []  # Assuming you are using cookies for authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "testUser@mail.com"
 *                 description: "The user's email address."
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: Mail sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Mail sent successfully!"
 *       400:
 *         description: Bad request, validation errors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email is required"
 */

router
    .route('/request-reset-password')
    .post(validator(forgotPasswordValidation), forgotPasswordController);

// Change password API
/**
 * @swagger
 * /v1/user/change-password:
 *   post:
 *     summary: Change the user's password
 *     security:
 *       - cookieAuth: []  # Assuming you are using cookies for authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "NewPassword@123"
 *                 description: "The new password for the user."
 *             required:
 *               - password
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password changed successfully"
 *       400:
 *         description: Bad request, validation errors
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Password is required"
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "New password cannot be the same as the old password"
 */

router
    .route('/change-password')
    .post(
        headerTokenChecker,
        validator(resetPasswordValidation),
        changePasswordController
    );

// Logout user
/**
 * @swagger
 * /v1/user/logout:
 *   get:
 *     summary: Logout user
 *     security:
 *       - cookieAuth: []  # Assuming you are using cookies for authentication
 *     responses:
 *       200:
 *         description: Logout user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Success"
 */

router.route('/logout').get(logoutController);

export default router;
