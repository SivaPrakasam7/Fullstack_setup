import { logErrorToFile } from '../../src/handler/logger';
import { IErrorHandler } from '../../src/handler/middleware';

export const createError = (code: number, message: string) => {
    const error = new Error(message);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (error as any).code = code;
    return error;
};

export const errorHandler: IErrorHandler = (error, _req, res, _next) => {
    logErrorToFile(error);
    res.status(error.code || 500).send({
        message: error.message || 'Something went wrong',
        error: true,
    });
};
