import { ReactNode } from 'react';

export interface IFormField {
    name?: string;
    label?: string;
    value?: ILargeRecord;
    error?: string;
    validations?: {
        type: 'regex' | 'function';
        message?: string;
        validate:
            | string
            | ((
                  values: ILargeRecord,
                  name: string
              ) => Promise<string> | string);
    }[];
    required?: boolean;
    requiredLabel?: string;
    type?:
        | 'label'
        | 'text'
        | 'textarea'
        | 'number'
        | 'date'
        | 'time'
        | 'datetime-local'
        | 'file'
        | 'tag'
        | 'password'
        | 'autocomplete'
        | 'select'
        | 'otp'
        | 'calendar'
        | 'checkbox'
        | 'chip'
        | 'multiTextField'
        | 'toggle'
        | 'radio'
        | 'custom';
    placeHolder?: string;
    helperText?: string;
    rows?: number;
    alignClass?: string;
    className?: string;
    layoutClass?: string;
    imageSize?: string;
    size?: string;
    disabled?: boolean;
    multiple?: boolean;
    min?: string;
    max?: string;
    accept?: string;
    format?: string;
    options?: { id: string; label: string }[];
    buttonText?: string;
    buttonSize?: string;
    ref?: string;
    initialFieldCount?: number;
    remove?: (index: number) => void;
    customField?: boolean;
    fileSize?: number;
    cropper?: boolean;
    length?: number;
    noError?: boolean;
    disableFilter?: boolean;
    maxLength?: number;

    //
    startIcon?: ReactNode;
    endIcon?: ReactNode;
    element?: ReactNode;
    icon?: ReactNode;
    onChange?: (field: IFieldChange) => void;
}

export type IFieldChange = {
    name: string;
    value: ILargeRecord;
    ignoreValidation?: boolean;
    ref?: string;
    id?: boolean;
};
