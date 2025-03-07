import fs from 'fs';
import path from 'path';
import { IError, IMiddleWare } from '../../src/handler/middleware';

// Function to get the current date in YYYY-MM-DD format
const getDateString = () => {
    return new Date().toISOString().split('T')[0];
};

// Error log file with date
const getErrorLogFilePath = () =>
    path.join(
        __dirname,
        `${process.env.MAIN_PATH}/logs`,
        `error-${getDateString()}.log`
    );

export const logErrorToFile = (error: IError) => {
    const logFilePath = getErrorLogFilePath();
    const logMessage = `[${new Date().toISOString()}] ${error.stack || error.message}\n`;
    if (!fs.existsSync(path.dirname(logFilePath))) {
        fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
    }
    fs.appendFileSync(logFilePath, logMessage, 'utf8');
};

// Access log file with date
const getAccessLogFilePath = () =>
    path.join(
        __dirname,
        `${process.env.MAIN_PATH}/logs`,
        `access-${getDateString()}.log`
    );

export const logAccess: IMiddleWare = (req, res, next) => {
    const logFilePath = getAccessLogFilePath();
    const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.url} ${req.ip} params: ${JSON.stringify(req.params || {})}, body: ${JSON.stringify(req.body || {})}\n`;
    if (!fs.existsSync(path.dirname(logFilePath))) {
        fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
    }
    fs.appendFileSync(logFilePath, logMessage, 'utf8');
    next();
};

// Mail log file with date
const getMailLogFilePath = () =>
    path.join(
        __dirname,
        `${process.env.MAIN_PATH}/logs`,
        `mail-${getDateString()}.log`
    );

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const logMail = (data: Record<string, any>) => {
    const logFilePath = getMailLogFilePath();
    const logMessage = `[${new Date().toISOString()}] Config: ${JSON.stringify(data.config)}, Error: ${JSON.stringify(data.error)}, Result: ${JSON.stringify(data.data || {})}\n`;
    if (!fs.existsSync(path.dirname(logFilePath))) {
        fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
    }
    fs.appendFileSync(logFilePath, logMessage, 'utf8');
};
