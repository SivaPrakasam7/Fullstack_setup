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
router.route('/login').post(validator(loginValidation), loginController);

// Get user profile API
router.route('/profile').get(tokenChecker, userController);

// Request email verification mail
router
    .route('/request-verification')
    .post(validator(requestVerificationValidation), requestVerifyController);

// Email and Phone verification API
router.route('/verify-email').get(headerTokenChecker, verifyEmailController);

router
    .route('/verify-phone')
    .post(validator(phoneVerificationValidation), verifyPhoneController);

// Generate reset password link API
router
    .route('/request-reset-password')
    .post(validator(emailValidation), forgotPasswordController);

// Change password API
router
    .route('/change-password')
    .post(
        headerTokenChecker,
        validator(passwordValidation),
        changePasswordController
    );

router
    .route('/update-password')
    .put(
        tokenChecker,
        validator(updatePasswordValidation),
        updatePasswordController
    );

// Logout user
router.route('/logout').post(tokenChecker, logoutController);

// Update profile
router
    .route('/update')
    .put(tokenChecker, validator(updateUserValidation), updateUserController);

export default router;
