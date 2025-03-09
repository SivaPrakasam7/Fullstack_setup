use `fullstack_keys`;

CREATE TABLE
    `keyPair` (
        `id` INT (11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        `clientId` CHAR(40) UNIQUE,
        `userId` CHAR(40),
        `publicKey` TEXT NOT NULL,
        `privateKey` TEXT NOT NULL,
        `createdAt` VARCHAR(100) NOT NULL
    );