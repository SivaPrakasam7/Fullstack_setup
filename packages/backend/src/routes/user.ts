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
 * /create:
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
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the user
 *                 example: John Doe
 *               password:
 *                 type: string
 *                 description: The user's password (required if providerId is not provided)
 *                 example: securepassword123
 *               providerId:
 *                 type: string
 *                 description: The provider ID for external authentication (required if password is not provided)
 *                 example: google12345
 *               profileURL:
 *                 type: string
 *                 description: URL to the user's profile picture
 *                 example: https://example.com/profile.jpg
 *               email:
 *                 type: string
 *                 description: The user's email address
 *                 example: john.doe@example.com
 *             oneOf:
 *               - required: [password]
 *               - required: [providerId]
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The ID of the created user
 *                   example: 12345
 *                 name:
 *                   type: string
 *                   example: John Doe
 *                 email:
 *                   type: string
 *                   example: john.doe@example.com
 *       400:
 *         description: Bad request - Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Either password or providerId is required
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Something went wrong
 */
router
    .route('/create')
    .post(validator(createUserValidation), createUserController);

// User login API
/**
 * @swagger
 * /login:
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
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email address
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 description: The user's password
 *                 example: securepassword123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Authentication token
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 12345
 *                     email:
 *                       type: string
 *                       example: john.doe@example.com
 *                     name:
 *                       type: string
 *                       example: John Doe
 *       400:
 *         description: Bad request - Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Password is required
 *       401:
 *         description: Unauthorized - Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid email or password
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Something went wrong
 */
router.route('/login').post(validator(loginValidation), loginController);

// Get user profile API
/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get user profile
 *     description: Retrieves the authenticated user's profile information. Requires a valid authentication token stored in a cookie.
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The user's ID
 *                   example: 12345
 *                 name:
 *                   type: string
 *                   description: The user's name
 *                   example: John Doe
 *                 email:
 *                   type: string
 *                   description: The user's email address
 *                   example: john.doe@example.com
 *                 profileURL:
 *                   type: string
 *                   description: URL to the user's profile picture
 *                   example: https://example.com/profile.jpg
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Authentication token required
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Something went wrong
 */
router.route('/profile').get(tokenChecker, userController);

// Request email verification mail
/**
 * @swagger
 * /request-verification:
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
 *                 description: The user's email address (required if phoneNumber is not provided)
 *                 example: john.doe@example.com
 *               phoneNumber:
 *                 type: string
 *                 description: The user's phone number (required if email is not provided)
 *                 example: +1234567890
 *             oneOf:
 *               - required: [email]
 *               - required: [phoneNumber]
 *     responses:
 *       200:
 *         description: Verification request sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Verification request sent
 *       400:
 *         description: Bad request - Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Either email or phoneNumber is required
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Something went wrong
 */
router
    .route('/request-verification')
    .post(validator(requestVerificationValidation), requestVerifyController);

// Email and Phone verification API
/**
 * @swagger
 * /verify-email:
 *   get:
 *     summary: Verify email
 *     description: Verifies a user's email address using a token provided in the Authorization header.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email verified successfully
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid or missing authorization token
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Something went wrong
 */
router.route('/verify-email').get(headerTokenChecker, verifyEmailController);

/**
 * @swagger
 * /verify-phone:
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
 *             required:
 *               - otp
 *             properties:
 *               otp:
 *                 type: string
 *                 description: The one-time password (OTP) sent to the user's phone
 *                 example: 123456
 *               phoneNumber:
 *                 type: string
 *                 description: The user's phone number to verify
 *                 example: +1234567890
 *     responses:
 *       200:
 *         description: Phone number verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Phone number verified successfully
 *       400:
 *         description: Bad request - Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: OTP is required
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Something went wrong
 */
router
    .route('/verify-phone')
    .post(validator(phoneVerificationValidation), verifyPhoneController);

// Generate reset password link API
/**
 * @swagger
 * /request-reset-password:
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
 *                 description: The user's email address to send the reset instructions
 *                 example: john.doe@example.com
 *     responses:
 *       200:
 *         description: Password reset request sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password reset instructions sent to your email
 *       400:
 *         description: Bad request - Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid email format
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Something went wrong
 */
router
    .route('/request-reset-password')
    .post(validator(emailValidation), forgotPasswordController);

// Change password API
/**
 * @swagger
 * /change-password:
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
 *                 description: The new password for the user
 *                 example: newsecurepassword123
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
 *                   example: Password changed successfully
 *       400:
 *         description: Bad request - Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Password is required
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid or missing authorization token
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Something went wrong
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
 * /update-password:
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
 *             required:
 *               - currentPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: The user's current password for verification
 *                 example: oldsecurepassword123
 *               password:
 *                 type: string
 *                 description: The new password to set
 *                 example: newsecurepassword123
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password updated successfully
 *       400:
 *         description: Bad request - Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Current password is required
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Authentication token required
 *       403:
 *         description: Forbidden - Current password incorrect
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Incorrect current password
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Something went wrong
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
 * /logout:
 *   post:
 *     summary: Log out user
 *     description: Logs out the authenticated user by invalidating their session or token. Requires a valid authentication token stored in a cookie.
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logged out successfully
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Authentication token required
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Something went wrong
 */
router.route('/logout').post(tokenChecker, logoutController);

// Update profile
/**
 * @swagger
 * /update:
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
 *                 description: The user's updated name
 *                 example: John Doe
 *               profileURL:
 *                 type: string
 *                 description: The updated URL to the user's profile picture
 *                 example: https://example.com/newprofile.jpg
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Profile updated successfully
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 12345
 *                     name:
 *                       type: string
 *                       example: John Doe
 *                     profileURL:
 *                       type: string
 *                       example: https://example.com/newprofile.jpg
 *       400:
 *         description: Bad request - Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid input data
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Authentication token required
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Something went wrong
 */
router
    .route('/update')
    .put(tokenChecker, validator(updateUserValidation), updateUserController);

export default router;
