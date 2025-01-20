import { executeKeysQuery } from '../../src/handler/db.ts';

//
export const addKeyPairRepo = async ({
    clientId,
    publicKey,
    privateKey,
    createdAt,
}: Record<string, string>) => {
    const query = `INSERT INTO keyPair (clientId, publicKey, privateKey, createdAt) VALUES (?, ?, ?, ?)`;
    const queryResponse = await executeKeysQuery(query, [
        clientId,
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
