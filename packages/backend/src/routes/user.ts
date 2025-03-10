import express from 'express';
import {
    changePasswordController,
    createUserController,
    forgotPasswordController,
    loginController,
    userController,
    requestVerifyController,
    logoutController,
    verifyEmailController,
    verifyPhoneController,
    updateUserController,
    updatePasswordController,
} from '../../src/controller/user';
import {
    headerTokenChecker,
    tokenChecker,
} from '../../src/handler/tokenVerification';
import { validator } from '../../src/handler/validator';
import {
    createUserValidation,
    emailValidation,
    loginValidation,
    passwordValidation,
    phoneVerificationValidation,
    requestVerificationValidation,
    updatePasswordValidation,
    updateUserValidation,
} from '../../src/validations/user';

//
const router = express.Router();

// Create user API
/**
 * @swagger
 * /v1/user/create:
 *   post:
 *     summary: Create a new user
 *     description: Creates a new user with the provided details. Either a password or providerId must be specified.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *               providerId:
 *                 type: string
 *               profileURL:
 *                 type: string
 *               email:
 *                 type: string
 *             example:
 *               name: "John Doe"
 *               password: "securepassword123"
 *               providerId: "google12345"
 *               profileURL: "https://example.com/profile.jpg"
 *               email: "john.doe@example.com"
 *     responses:
 *       200:
 *         description: User created successfully
 *       400:
 *         description: Bad request - Validation failed
 *       500:
 *         description: Internal server error
 */
router
    .route('/create')
    .post(validator(createUserValidation), createUserController);

// User login API
/**
 * @swagger
 * /v1/user/login:
 *   post:
 *     summary: User login
 *     description: Authenticates a user with their email and password.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             example:
 *               email: "john.doe@example.com"
 *               password: "securepassword123"
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Bad request - Validation failed
 *       401:
 *         description: Unauthorized - Invalid credentials
 *       500:
 *         description: Internal server error
 */
router.route('/login').post(validator(loginValidation), loginController);

// Get user profile API
/**
 * @swagger
 * /v1/user/profile:
 *   get:
 *     summary: Get user profile
 *     description: Retrieves the authenticated user's profile information. Requires a valid authentication token stored in a cookie.
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Internal server error
 */
router.route('/profile').get(tokenChecker, userController);

// Request email verification mail
/**
 * @swagger
 * /v1/user/request-verification:
 *   post:
 *     summary: Request verification
 *     description: Requests verification for a user by providing either an email or phone number.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *             example:
 *               email: "john.doe@example.com"
 *               phoneNumber: "+1234567890"
 *     responses:
 *       200:
 *         description: Verification request sent successfully
 *       400:
 *         description: Bad request - Validation failed
 *       500:
 *         description: Internal server error
 */
router
    .route('/request-verification')
    .post(validator(requestVerificationValidation), requestVerifyController);

// Email and Phone verification API
/**
 * @swagger
 * /v1/user/verify-email:
 *   get:
 *     summary: Verify email
 *     description: Verifies a user's email address using a token provided in the Authorization header.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Internal server error
 */
router.route('/verify-email').get(headerTokenChecker, verifyEmailController);

/**
 * @swagger
 * /v1/user/verify-phone:
 *   post:
 *     summary: Verify phone number
 *     description: Verifies a user's phone number using an OTP and phone number.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               otp:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *             example:
 *               otp: "123456"
 *               phoneNumber: "+1234567890"
 *     responses:
 *       200:
 *         description: Phone number verified successfully
 *       400:
 *         description: Bad request - Validation failed
 *       500:
 *         description: Internal server error
 */
router
    .route('/verify-phone')
    .post(validator(phoneVerificationValidation), verifyPhoneController);

// Generate reset password link API
/**
 * @swagger
 * /v1/user/request-reset-password:
 *   post:
 *     summary: Request password reset
 *     description: Initiates a password reset process by sending a reset link or code to the provided email.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *             example:
 *               email: "john.doe@example.com"
 *     responses:
 *       200:
 *         description: Password reset request sent successfully
 *       400:
 *         description: Bad request - Validation failed
 *       500:
 *         description: Internal server error
 */
router
    .route('/request-reset-password')
    .post(validator(emailValidation), forgotPasswordController);

// Change password API
/**
 * @swagger
 * /v1/user/change-password:
 *   post:
 *     summary: Change user password
 *     description: Changes the user's password using a new password provided in the request body. Requires a valid authentication token in the Authorization header.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *             example:
 *               password: "newsecurepassword123"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Bad request - Validation failed
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Internal server error
 */
router
    .route('/change-password')
    .post(
        headerTokenChecker,
        validator(passwordValidation),
        changePasswordController
    );

/**
 * @swagger
 * /v1/user/update-password:
 *   put:
 *     summary: Update user password
 *     description: Updates the user's password by verifying the current password and setting a new one. Requires a valid authentication token stored in a cookie.
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *               password:
 *                 type: string
 *             example:
 *               currentPassword: "oldsecurepassword123"
 *               password: "newsecurepassword123"
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Bad request - Validation failed
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Current password incorrect
 *       500:
 *         description: Internal server error
 */
router
    .route('/update-password')
    .put(
        tokenChecker,
        validator(updatePasswordValidation),
        updatePasswordController
    );

// Logout user
/**
 * @swagger
 * /v1/user/logout:
 *   post:
 *     summary: Log out user
 *     description: Logs out the authenticated user by invalidating their session or token. Requires a valid authentication token stored in a cookie.
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Internal server error
 */
router.route('/logout').post(tokenChecker, logoutController);

// Update profile
/**
 * @swagger
 * /v1/user/update:
 *   put:
 *     summary: Update user profile
 *     description: Updates the authenticated user's profile information, such as name or profile URL. Requires a valid authentication token stored in a cookie.
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               profileURL:
 *                 type: string
 *             example:
 *               name: "John Doe"
 *               profileURL: "https://example.com/newprofile.jpg"
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *       400:
 *         description: Bad request - Validation failed
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Internal server error
 */
router
    .route('/update')
    .put(tokenChecker, validator(updateUserValidation), updateUserController);

export default router;
