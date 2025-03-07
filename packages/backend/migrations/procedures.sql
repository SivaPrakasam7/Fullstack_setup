USE `fullstack`;

-- 1. GetUserByIDandSecretKey
DROP PROCEDURE IF EXISTS GetUserByIDandSecretKey;
CREATE PROCEDURE GetUserByIDandSecretKey(
    IN p_userId VARCHAR(255),
    IN p_secretKey VARCHAR(255)
)
BEGIN
    SELECT * FROM users 
    WHERE userId = p_userId 
    AND secretKey = p_secretKey 
    AND isDeleted = 0
    LIMIT 1;
END;

-- 2. CreateUser
DROP PROCEDURE IF EXISTS CreateUser;
CREATE PROCEDURE CreateUser(
    IN p_userId VARCHAR(255),
    IN p_name VARCHAR(255),
    IN p_email VARCHAR(255),
    IN p_phoneNumber VARCHAR(255),
    IN p_profileURL VARCHAR(255),
    IN p_passwordHash VARCHAR(255),
    IN p_providerId VARCHAR(255),
    IN p_secretKey VARCHAR(255),
    OUT p_insertId BIGINT
)
BEGIN
    INSERT INTO users (userId, name, email, phoneNumber, profileURL, passwordHash, providerId, secretKey)
    VALUES (p_userId, p_name, p_email, p_phoneNumber, p_profileURL, p_passwordHash, p_providerId, p_secretKey);
    SET p_insertId = LAST_INSERT_ID();
    SELECT p_insertId AS insertId; -- Return the OUT parameter directly
END;

-- 3. UpdateEmailVerification
DROP PROCEDURE IF EXISTS UpdateEmailVerification;
CREATE PROCEDURE UpdateEmailVerification(
    IN p_email VARCHAR(255),
    OUT p_affectedRows INT
)
BEGIN
    INSERT INTO verifications (source) 
    VALUES (p_email);
    SET p_affectedRows = ROW_COUNT();
    SELECT p_affectedRows AS affectedRows; -- Return the OUT parameter
END;

-- 4. UpdateVerificationOTP
DROP PROCEDURE IF EXISTS UpdateVerificationOTP;
CREATE PROCEDURE UpdateVerificationOTP(
    IN p_phoneNumber VARCHAR(255),
    IN p_otp VARCHAR(10),
    OUT p_affectedRows INT
)
BEGIN
    INSERT INTO verifications (source, code) 
    VALUES (p_phoneNumber, p_otp)
    ON DUPLICATE KEY UPDATE code = p_otp;
    SET p_affectedRows = ROW_COUNT();
    SELECT p_affectedRows AS affectedRows; -- Return the OUT parameter
END;

-- 5. UpdateVerification
DROP PROCEDURE IF EXISTS UpdateVerification;
CREATE PROCEDURE UpdateVerification(
    IN p_source VARCHAR(255),
    IN p_type ENUM('email', 'phone'),
    IN p_otp VARCHAR(10),
    OUT p_affectedRows INT
)
BEGIN
    IF p_type = 'email' THEN
        UPDATE verifications 
        SET verified = 1 
        WHERE source = p_source;
    ELSEIF p_type = 'phone' THEN
        UPDATE verifications 
        SET verified = 1, code = ''
        WHERE source = p_source 
        AND code = p_otp;
    END IF;
    SET p_affectedRows = ROW_COUNT();
    SELECT p_affectedRows AS affectedRows; -- Return the OUT parameter
END;

-- 6. GetUserBySource
DROP PROCEDURE IF EXISTS GetUserBySource;
CREATE PROCEDURE GetUserBySource(
    IN p_email VARCHAR(255),
    IN p_phoneNumber VARCHAR(255)
)
BEGIN
    IF p_email IS NOT NULL THEN
        SELECT * FROM users 
        WHERE email = p_email 
        AND status = 'active' 
        AND isDeleted = 0
        LIMIT 1;
    ELSE
        SELECT * FROM users 
        WHERE phoneNumber = p_phoneNumber 
        AND status = 'active' 
        AND isDeleted = 0
        LIMIT 1;
    END IF;
END;

-- 7. CheckUserVerified
DROP PROCEDURE IF EXISTS CheckUserVerified;
CREATE PROCEDURE CheckUserVerified(
    IN p_source VARCHAR(255),
    OUT p_count INT
)
BEGIN
    SELECT COUNT(*) INTO p_count 
    FROM verifications 
    WHERE source = p_source 
    AND verified = 1 
    AND isDeleted = 0;
    SELECT p_count AS count; -- Return the OUT parameter
END;

-- 8. GetUserById
DROP PROCEDURE IF EXISTS GetUserById;
CREATE PROCEDURE GetUserById(
    IN p_userId VARCHAR(255)
)
BEGIN
    SELECT userId, name, email, phoneNumber, profileURL 
    FROM users 
    WHERE userId = p_userId 
    AND status = 'active' 
    AND isDeleted = 0
    LIMIT 1;
END;

-- 9. GetLocalUserById
DROP PROCEDURE IF EXISTS GetLocalUserById;
CREATE PROCEDURE GetLocalUserById(
    IN p_userId VARCHAR(255)
)
BEGIN
    SELECT * 
    FROM users 
    WHERE userId = p_userId 
    AND status = 'active' 
    AND isDeleted = 0
    LIMIT 1;
END;

-- 10. UpdateResetPasswordKey
DROP PROCEDURE IF EXISTS UpdateResetPasswordKey;
CREATE PROCEDURE UpdateResetPasswordKey(
    IN p_resetPasswordKey VARCHAR(255),
    IN p_userId VARCHAR(255),
    OUT p_affectedRows INT
)
BEGIN
    UPDATE users 
    SET resetPasswordKey = p_resetPasswordKey 
    WHERE userId = p_userId 
    AND isDeleted = 0;
    SET p_affectedRows = ROW_COUNT();
    SELECT p_affectedRows AS affectedRows; -- Return the OUT parameter
END;

-- 11. UpdatePasswordByKey
DROP PROCEDURE IF EXISTS UpdatePasswordByKey;
CREATE PROCEDURE UpdatePasswordByKey(
    IN p_passwordHash VARCHAR(255),
    IN p_userId VARCHAR(255),
    IN p_secretKey VARCHAR(255),
    IN p_resetPasswordKey VARCHAR(255),
    OUT p_affectedRows INT
)
BEGIN
    UPDATE users 
    SET passwordHash = p_passwordHash,
        secretKey = p_secretKey,
        resetPasswordKey = ''
    WHERE userId = p_userId 
    AND resetPasswordKey = p_resetPasswordKey 
    AND isDeleted = 0;
    SET p_affectedRows = ROW_COUNT();
    SELECT p_affectedRows AS affectedRows; -- Return the OUT parameter
END;

-- 12. UpdatePassword
DROP PROCEDURE IF EXISTS UpdatePassword;
CREATE PROCEDURE UpdatePassword(
    IN p_passwordHash VARCHAR(255),
    IN p_userId VARCHAR(255),
    OUT p_affectedRows INT
)
BEGIN
    UPDATE users 
    SET passwordHash = p_passwordHash 
    WHERE userId = p_userId 
    AND isDeleted = 0;
    SET p_affectedRows = ROW_COUNT();
    SELECT p_affectedRows AS affectedRows; -- Return the OUT parameter
END;

-- 13. IncreaseFailedAttempt
DROP PROCEDURE IF EXISTS IncreaseFailedAttempt;
CREATE PROCEDURE IncreaseFailedAttempt(
    IN p_userId VARCHAR(255),
    OUT p_affectedRows INT
)
BEGIN
    UPDATE users 
    SET failedAttempts = failedAttempts + 1,
        isSuspended = CASE WHEN failedAttempts >= 3 THEN 1 ELSE 0 END,
        suspendedAt = CASE WHEN failedAttempts >= 3 THEN CURRENT_TIMESTAMP ELSE NULL END
    WHERE userId = p_userId 
    AND isDeleted = 0;
    SET p_affectedRows = ROW_COUNT();
    SELECT p_affectedRows AS affectedRows; -- Return the OUT parameter
END;

-- 14. UpdateSecretKey
DROP PROCEDURE IF EXISTS UpdateSecretKey;
CREATE PROCEDURE UpdateSecretKey(
    IN p_secretKey VARCHAR(255),
    IN p_userId VARCHAR(255),
    OUT p_affectedRows INT
)
BEGIN
    UPDATE users 
    SET secretKey = p_secretKey 
    WHERE userId = p_userId 
    AND isDeleted = 0;
    SET p_affectedRows = ROW_COUNT();
    SELECT p_affectedRows AS affectedRows; -- Return the OUT parameter
END;