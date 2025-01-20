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
    res.status(error.code || 500).send({
        message: error.message || 'Something went wrong',
        error: true,
    });
};
