use `fullstack`;

-- Users
CREATE TABLE
    `users` (
        `id` INT (11) AUTO_INCREMENT,
        `userId` VARCHAR(100) NOT NULL, -- Store generated userId 
        `email` VARCHAR(100) NOT NULL UNIQUE, -- Email address its optional 
        `phoneNumber` VARCHAR(40), -- Phone number 
        `name` VARCHAR(250), -- Name of user
        `profileURL` VARCHAR(255), -- Store profile image URL
        `bannerURL` VARCHAR(255), -- Store user banner background image
        `passwordHash` VARCHAR(255), -- Store password hash
        `providerId` VARCHAR(255), -- For google authentication
        `status` enum ('active', 'inactive') NOT NULL DEFAULT 'active', -- User status
        `secretKey` VARCHAR(100) NOT NULL, -- Attach secret to token, It is used for handle logout from all devices
        `resetPasswordKey` VARCHAR(100) DEFAULT NULL,
        `failedAttempts` INT (11) NOT NULL DEFAULT 0,
        `isSuspended` INT (11) NOT NULL DEFAULT 0,
        `suspendedAt` TIMESTAMP,
        `isDeleted` INT (11) NOT NULL DEFAULT 0,
        `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
        `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`),
        UNIQUE (`email`),
        UNIQUE (`userId`)
    );

CREATE INDEX idx_userId ON `users` (`userId`);

CREATE INDEX idx_email ON `users` (`email`);

-- Verifications
CREATE TABLE
    `verifications` (
        `id` INT (11) AUTO_INCREMENT,
        `source` VARCHAR(255) NOT NULL, -- The actual source (email)
        `verified` INT (11) NOT NULL DEFAULT 0,
        `code` CHAR(6),
        `isDeleted` INT (11) NOT NULL DEFAULT 0,
        `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
        `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
        PRIMARY KEY (`id`)
    );

CREATE INDEX idx_source ON `verifications` (`source`);