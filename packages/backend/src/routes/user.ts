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
