import fs from 'fs';
import path from 'path';

//
import { IError, IMiddleWare } from '../../src/handler/middleware';

//
const logFilePath = path.join(__dirname, '../../logs', 'error.log');

export const logErrorToFile = (error: IError) => {
    const logMessage = `[${new Date().toISOString()}] ${error.stack || error.message}\n`;
    if (!fs.existsSync(path.dirname(logFilePath))) {
        fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
    }
    fs.appendFileSync(logFilePath, logMessage, 'utf8');
};

const accessLogFilePath = path.join(__dirname, '../../logs', 'access.log');

export const logAccess: IMiddleWare = (req, res, next) => {
    const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.url} ${req.ip} params: ${JSON.stringify(req.params || {})}, body: ${JSON.stringify(req.body || {})}\n`;
    if (!fs.existsSync(path.dirname(accessLogFilePath))) {
        fs.mkdirSync(path.dirname(accessLogFilePath), { recursive: true });
    }
    fs.appendFileSync(accessLogFilePath, logMessage, 'utf8');
    next();
};

const mailLogFilePath = path.join(__dirname, '../../logs', 'mail.log');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const logMail = (data: Record<string, any>) => {
    const logMessage = `[${new Date().toISOString()}] Config : ${JSON.stringify(data.config)} , Error : ${JSON.stringify(data.error)} , Result: ${JSON.stringify(data.data || {})}\n`;
    if (!fs.existsSync(path.dirname(mailLogFilePath))) {
        fs.mkdirSync(path.dirname(mailLogFilePath), { recursive: true });
    }
    fs.appendFileSync(mailLogFilePath, logMessage, 'utf8');
};
