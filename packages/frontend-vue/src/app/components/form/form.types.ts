export interface IFormField {
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
    rows?: string;
    alignClass?: string;
    class?: string;
    layoutClass?: string;
    imageSize?: string;
    size?: string;
    disabled?: boolean;
    multiple?: boolean;
    min?: string;
    max?: string;
    accept?: string;
    format?: string;
    options?: string[];
    buttonText?: string;
    buttonSize?: string;
    ref?: string;
    initialFieldCount?: number;
    remove?: (index: number) => void;
    customField?: boolean;
    fileSize?: number;
    cropper?: boolean;
}

export type IFieldChange = {
    name: string;
    value: ILargeRecord;
    ignoreValidation?: boolean;
    ref?: string;
};
