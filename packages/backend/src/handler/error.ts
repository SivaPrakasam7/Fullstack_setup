import { logErrorToFile } from '../../src/handler/logger';
import { IErrorHandler } from '../../src/handler/middleware';

//
import messages from '../../src/utils/messages';

//
export const createError = (code: number, message: string) => {
    const error = new Error(message);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (error as any).code = code;
    return error;
};

export const errorHandler: IErrorHandler = (error, _req, res, _next) => {
    if (!Object.values(messages.responses).includes(`${error.message}`))
        logErrorToFile(error);

    const statusCode =
        typeof error.code === 'string' ? parseInt(error.code, 10) : error.code;
    const validStatusCode = isNaN(statusCode) ? 500 : statusCode;
    const validateMessage =
        typeof error.code === 'string' ? 'Something went wrong' : error.message;

    res.status(validStatusCode).send({
        message: validateMessage,
    });
};
