/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Request, Response } from 'express';
import type { ObjectSchema } from 'yup';

export type IErrorHandler = (
    error: IError,
    req: Request,
    res: Response,
    next: IErrorCallback
) => void;

export type IErrorCallback = (args?: Record<string, any>) => void;

export interface IError {
    stack: string;
    code: number;
    message: string | boolean | Record<string, string>;
}

export type IMiddleWare = (
    req: Request,
    res: Response,
    next: IErrorCallback,
    optional?: boolean
) => void;

export type IValidator = (validation: ObjectSchema<any>) => IMiddleWare;

export type IService<T> = (data: Record<string, any>) => Promise<T>;
