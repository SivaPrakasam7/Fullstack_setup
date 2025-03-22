import {
    createElement,
    FormEvent,
    ReactNode,
    useEffect,
    useMemo,
    useState,
} from 'react';

//
import { getTagValues } from 'services/constants';

//
import { IFieldChange, IFormField } from './form.types';
import { TextField } from './textField';
import { CheckBox } from './checkBox';
import { FileUpload } from './fileUpload';
import { RadioButton } from './radioButton';

//
export const FormBuilder = ({
    form,
    call,
    buttonText,
    buttonClass,
    layoutClass,
    formTop,
    formBottom,
}: {
    form: Record<string, IFormField>;
    call: (...args: ILargeRecord) => Promise<boolean>;
    buttonText?: string;
    buttonClass?: string;
    layoutClass?: string;
    formTop?: ReactNode;
    formBottom?: ReactNode;
}) => {
    const [data, setData] = useState<Record<string, IFormField>>({});
    const [initialData, setInitialData] = useState<Record<string, IFormField>>(
        {}
    );
    const [loading, setLoading] = useState(false);
    const [debounceTimer, setDebounceTimer] = useState(0);

    //

    const getPayload = () => {
        const payload: Record<string, ILargeRecord> = {};
        for (const key in data) {
            if (data[key].ref) {
                const refKey = data[key].ref;
                if (!payload[refKey]) payload[refKey] = [];
                payload[refKey].push(data[key].value);
            } else
                payload[key] =
                    data[key].type === 'tag'
                        ? getTagValues(data[key].value)
                        : data[key].value;
        }
        return payload;
    };

    const onFieldChange = async (field: IFieldChange) => {
        setData((_data) => {
            _data[field.name] = field.ref
                ? { ..._data[field.ref], ref: field.ref, value: field.value }
                : { ..._data[field.name], value: field.value };

            return _data;
        });

        if (!field.ignoreValidation) {
            if (debounceTimer) clearTimeout(debounceTimer);

            setDebounceTimer(
                setTimeout(() => {
                    const fieldData = data[field.name];
                    validateField(field.name, fieldData);
                }, 500)
            );
        }
    };

    const validateField = async (name: string, fieldData: IFormField) => {
        let errorMessage = '';
        const value = fieldData.value || '';

        if (
            fieldData.required &&
            (fieldData.type === 'tag'
                ? !value
                      .split(/( |;|,)/g)
                      .filter((t: string) =>
                          t.replaceAll(/(\s|;|,)/g, '').trim()
                      ).length
                : typeof value === 'object'
                  ? !value.length
                  : !`${value}`.trim())
        ) {
            errorMessage =
                fieldData.requiredLabel ||
                `${fieldData.label || 'field'} is required`;
        } else if (fieldData.validations) {
            for (const key in fieldData.validations) {
                const validation = fieldData.validations[key];
                const regex = new RegExp(validation.validate as string);
                if (validation.type === 'function') {
                    const payload = getPayload();
                    const call = validation.validate as (
                        values: ILargeRecord,
                        name: string
                    ) => Promise<string> | string;
                    errorMessage = await call(payload, name);
                } else if (
                    (validation.type === 'regex' &&
                        typeof value === 'object' &&
                        value.filter((v: ILargeRecord) => !regex.test(v))
                            .length) ||
                    (fieldData.type === 'tag'
                        ? value.split(/( |;|,)/g).filter((t: string) => {
                              const data = t.replaceAll(/(\s|;|,)/g, '').trim();
                              if (data) return !regex.test(data);
                              return false;
                          }).length
                        : !regex.test(value))
                ) {
                    errorMessage = validation.message || 'Invalid value';
                }
                if (errorMessage) break;
            }
        }
        setData((_data) => {
            const updatedData = { ..._data };
            updatedData[name] = {
                ...updatedData[name],
                error: errorMessage,
            };
            return updatedData;
        });
        return errorMessage;
    };

    const validate = async () => {
        const errors: Record<string, string> = {};
        for (const field in data) {
            if (
                data[field].type !== 'label' &&
                (data[field].type !== 'multiTextField' ||
                    (data[field].type === 'multiTextField' && data[field].ref))
            )
                errors[field] = await validateField(field, data[field]);
        }
        return !Object.values(errors).filter(Boolean).length;
    };

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const payload = getPayload();
        if (await validate()) {
            const success = await call(payload);
            if (success) setData(initialData);
        }
        setLoading(false);
    };

    const fields = useMemo(
        () =>
            Object.entries(initialData || {}).filter(
                ([_, field]) => !field.ref
            ),
        [initialData]
    );

    //
    useEffect(() => {
        setData({ ...form });
        setInitialData({ ...form });
    }, [form]);

    return (
        <form
            className={`grid gap-1 w-auto relative ${layoutClass}`}
            onSubmit={onSubmit}
        >
            {formTop}
            {fields.map(([fieldName, field]) => (
                <div
                    key={`${fieldName}-holder`}
                    className={`w-full ${field.alignClass}`}
                >
                    <FormElements
                        fieldName={fieldName}
                        field={data[fieldName]}
                        onFieldChange={onFieldChange}
                    />
                </div>
            ))}
            {/* <div className="h-5" /> */}
            {formBottom ? (
                formBottom
            ) : (
                <button
                    disabled={loading}
                    type="submit"
                    data-testid="SUBMIT"
                    className={`app-button border-transparent app-shadow ${loading ? 'text-gray-400' : ''} ${buttonClass}`}
                    onContextMenu={() => {
                        return false;
                    }}
                >
                    {buttonText}
                </button>
            )}
            {loading && (
                <div className="bg-gray-100 bg-opacity-50 dark:bg-transparent absolute w-full h-full rounded-lg flex items-center justify-center">
                    <div className="dot-pulse"></div>
                </div>
            )}
        </form>
    );
};

export const FormElements = ({
    fieldName,
    field,
    onFieldChange,
}: {
    fieldName: string;
    field: IFormField;
    onFieldChange: (field: IFieldChange) => void;
}) => {
    if (field.type === 'custom' && field.element)
        return createElement(field.element, { onFieldChange });
    else if (field.type === 'label')
        return (
            <label className={field.layoutClass}>
                {field.label}
                {field.required && (
                    <span
                        v-show="field.label && field.required"
                        className="text-gray-600/50 dark:text-white/50 font-bold text-xs"
                    >
                        *
                    </span>
                )}
                {field.icon}
            </label>
        );
    else if (field.type === 'checkbox')
        return (
            <CheckBox
                name={fieldName}
                label={field.label}
                value={field.value}
                error={field.error}
                required={field.required}
                disabled={field.disabled}
                helperText={field.helperText}
                layoutClass={field.layoutClass}
                options={field.options || []}
                customField={field.customField}
                onChange={onFieldChange}
            />
        );
    else if (field.type === 'radio')
        return (
            <RadioButton
                name={fieldName}
                label={field.label}
                value={field.value}
                error={field.error}
                required={field.required}
                disabled={field.disabled}
                helperText={field.helperText}
                layoutClass={field.layoutClass}
                options={field.options || []}
                onChange={onFieldChange}
            />
        );
    else if (field.type === 'file')
        return (
            <FileUpload
                name={fieldName}
                label={field.label}
                value={field.value}
                error={field.error}
                required={field.required}
                disabled={field.disabled}
                imageSize={field.imageSize}
                accept={field.accept}
                size={field.size}
                max={field.max}
                className={field.className}
                layoutClass={field.layoutClass}
                fileSize={field.fileSize}
                cropper={field.cropper}
                onChange={onFieldChange}
                icon={field.icon}
            />
        );
    else {
        return (
            <TextField
                name={fieldName}
                label={field.label}
                value={field.value}
                options={field.options || []}
                error={field.error}
                required={field.required}
                disabled={field.disabled}
                placeHolder={field.placeHolder}
                helperText={field.helperText}
                type={field.type!}
                size={field.size}
                rows={field.rows}
                min={field.min}
                max={field.max}
                maxLength={field.maxLength}
                className={field.className}
                layoutClass={field.layoutClass}
                format={field.format}
                onChange={(data) => {
                    onFieldChange(data);
                    field?.onChange?.(data);
                }}
                startIcon={field.startIcon}
                endIcon={field.endIcon}
                noError={field.noError}
                length={field.length}
                disableFilter={field.disableFilter}
            />
        );
    }
};
