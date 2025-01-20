/* eslint-disable @typescript-eslint/no-explicit-any */
import mysql, { Pool, PoolOptions } from 'mysql2/promise';

export class MYSQLConnection {
    private static pool: Pool;
    private static logspool: Pool;
    private static keyspool: Pool;
    private constructor() {}

    static configurePool(): Pool {
        if (!MYSQLConnection.pool) {
            const poolOptions: PoolOptions = {
                connectionLimit: 150,
                host: process.env.DB_HOST,
                port: parseInt(process.env.DATABASE_PORT!),
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DATABASE_NAME,
                debug: false,
                multipleStatements: false,
                charset: 'utf8mb4',
            };
            MYSQLConnection.pool = mysql.createPool(poolOptions);

            console.log('MySQL pool connection configured.');
        }

        return MYSQLConnection.pool;
    }

    static configureLogsPool(): Pool {
        if (!MYSQLConnection.logspool) {
            const poolOptions: PoolOptions = {
                connectionLimit: 150,
                host: process.env.DB_HOST,
                port: parseInt(process.env.DATABASE_PORT!),
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.LOG_DATABASE_NAME,
                debug: false,
                multipleStatements: false,
                charset: 'utf8mb4',
            };
            MYSQLConnection.logspool = mysql.createPool(poolOptions);

            console.log('MySQL Logs pool connection configured.');
        }

        return MYSQLConnection.logspool;
    }

    static configureKeysPool(): Pool {
        if (!MYSQLConnection.keyspool) {
            const poolOptions: PoolOptions = {
                connectionLimit: 150,
                host: process.env.DB_HOST,
                port: parseInt(process.env.DATABASE_PORT!),
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.KEY_DATABASE_NAME,
                debug: false,
                multipleStatements: false,
                charset: 'utf8mb4',
            };
            MYSQLConnection.keyspool = mysql.createPool(poolOptions);

            console.log('MySQL Logs pool connection configured.');
        }

        return MYSQLConnection.keyspool;
    }

    static closePool() {
        if (MYSQLConnection.pool) {
            MYSQLConnection.pool.end();
            console.log('MySQL pool connection closed.');
        }
        if (MYSQLConnection.logspool) {
            MYSQLConnection.logspool.end();
            console.log('MySQL pool connection closed.');
        }
        if (MYSQLConnection.keyspool) {
            MYSQLConnection.keyspool.end();
            console.log('MySQL pool connection closed.');
        }
    }
}

export const executeQuery: IQuery = async (
    query: string,
    values?: any
): Promise<any> => {
    const pool = MYSQLConnection.configurePool();
    const [results] = await pool.query(query, values);
    return results;
};

export const executeLogsQuery: IQuery = async (
    query: string,
    values?: any
): Promise<any> => {
    const pool = MYSQLConnection.configureLogsPool();
    const [results] = await pool.query(query, values);
    return results;
};

export const executeKeysQuery: IQuery = async (
    query: string,
    values?: any
): Promise<any> => {
    const pool = MYSQLConnection.configureKeysPool();
    const [results] = await pool.query(query, values);
    return results;
};

export type IQuery = (query: string, values?: any) => Promise<any>;
