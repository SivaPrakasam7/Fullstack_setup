import { executeKeysQuery } from '../../src/handler/db.ts';

//
export const addKeyPairRepo = async ({
    clientId,
    userId,
    publicKey,
    privateKey,
    createdAt,
}: Record<string, string>) => {
    const query = `INSERT INTO keyPair (clientId, userId, publicKey, privateKey, createdAt) VALUES (?, ?, ?, ?, ?)`;
    const queryResponse = await executeKeysQuery(query, [
        clientId,
        userId,
        publicKey,
        privateKey,
        createdAt,
    ]);

    return queryResponse.insertId;
};

export const getKeysRepo = async (clientId: string) => {
    const query = `SELECT * FROM keyPair WHERE clientId = ?`;
    const queryResponse = await executeKeysQuery(query, [clientId]);

    return queryResponse[0];
};

export const getKeysByUserIdRepo = async (userId: string) => {
    const query = `SELECT * FROM keyPair WHERE userId = ?`;
    const queryResponse = await executeKeysQuery(query, [userId]);

    return queryResponse[0];
};

export const updateClientUserId = async (clientId: string, userId: string) => {
    const query = `UPDATE keyPair SET userId=? WHERE clientId=?`;

    const queryResponse = await executeKeysQuery(query, [userId, clientId]);

    return queryResponse.affectedRows;
};
