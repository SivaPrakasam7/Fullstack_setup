use `fullstack_keys`;

CREATE TABLE
    `keyPair` (
        `clientId` VARCHAR(255) PRIMARY KEY,
        `publicKey` TEXT NOT NULL,
        `privateKey` TEXT NOT NULL,
        `createdAt` VARCHAR(100) NOT NULL
    );