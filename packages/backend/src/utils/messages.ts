export default {
    responses: {
        failedToCreateUser: 'User creation failed',
        userCreated: 'User created successfully',
        userNotFound: 'User not found',
        userAlreadyExist: 'Email already exists',
        noPasswordAuth: 'Password authentication not supported',
        invalidCred: 'Invalid credential',
        unverifiedUser: 'Account not verified',
        tokenNotFound: 'Token not found',
        tokenExpired: 'Token expired',
        unauthorized: 'Unauthorized',
        verified: 'Account verified',
        passwordChanged: 'Password changed successfully',
        passwordChangeFailed: 'Password change failed',
        previousPasswordError:
            'New password cannot be the same as the old password',
        success: 'Success',
        failed: 'Failed',
        expired: 'Expired',
        notFound: 'Not found',
        mailSent: 'Mail sent successfully!',
        keyExpired: 'KEY_EXPIRED',
        invalidRequest: 'Invalid request',
        accountSuspended: (time: number) =>
            `Your account is suspended. It will be resumed in ${time} minutes due to 3 invalid credential attempts`,
    },
};
