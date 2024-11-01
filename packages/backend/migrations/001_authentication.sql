use `fullstack`;

-- Users
DROP TABLE IF EXISTS `users`;

CREATE TABLE
    `users` (
        `id` int (11) AUTO_INCREMENT,
        `userId` VARCHAR(100) NOT NULL, -- Store generated userId 
        `email` VARCHAR(100), -- Email address its optional 
        `name` VARCHAR(250), -- Name of user
        `profileURL` VARCHAR(255), -- Store profile image URL
        `bannerURL` VARCHAR(255), -- Store user banner background image
        `passwordHash` VARCHAR(255), -- Store password hash
        `providerId` VARCHAR(255), -- For google authentication
        `secretKey` VARCHAR(100) NOT NULL, -- Attach secret to token, It is used for handle logout from all devices
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
DROP TABLE IF EXISTS `verifications`;

CREATE TABLE
    `verifications` (
        `id` INT (11) AUTO_INCREMENT,
        `source` VARCHAR(255) NOT NULL, -- The actual source (email)
        `verified` INT (11) NOT NULL DEFAULT 0,
        `isDeleted` INT (11) NOT NULL DEFAULT 0,
        `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
        `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
        PRIMARY KEY (`id`)
    );

CREATE INDEX idx_source ON `verifications` (`source`);