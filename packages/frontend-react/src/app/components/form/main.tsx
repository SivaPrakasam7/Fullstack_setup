import { FormEvent, ReactNode, useEffect, useState } from 'react';

//
import { getTagValues } from 'src/constants';

//
import { IFieldChange, IFormField } from './form.types';
import { TextField } from './textField';

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
                })
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
            _data[name].error = errorMessage;
            return _data;
        });
    };

    const validate = async () => {
        for (const field in data) {
            if (
                data[field].type !== 'label' &&
                (data[field].type !== 'multiTextField' ||
                    (data[field].type === 'multiTextField' && data[field].ref))
            )
                await validateField(field, data[field]);
        }
        return !Object.values(data).filter((f) => Boolean(f.error)).length;
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

    //
    useEffect(() => {
        setData(form);
        setInitialData(form);
    }, [JSON.stringify(form)]);

    return (
        <form
            className={`grid gap-1 w-auto relative ${layoutClass}`}
            onSubmit={onSubmit}
        >
            {formTop}
            {Object.entries(data || {})
                .filter(([_, field]) => !field.ref)
                .map(([fieldName, field]) => (
                    <div
                        key={fieldName}
                        className={`w-full ${field.alignClass}`}
                    >
                        <FormElements
                            fieldName={fieldName}
                            field={field}
                            onFieldChange={onFieldChange}
                        />
                    </div>
                ))}
            {formBottom ? (
                formBottom
            ) : (
                <button
                    disabled={loading}
                    type="submit"
                    data-testid="SUBMIT"
                    className={`app-button ${loading ? 'text-gray-400' : ''} ${buttonClass}`}
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
    if (field.type === 'custom') return field.element;
    else if (field.type === 'label')
        return (
            <label className={field.layoutClass}>
                {field.label}
                <span
                    v-show="field.label && field.required"
                    className="text-red-400 font-bold text-xs"
                >
                    *
                </span>
                {field.icon}
            </label>
        );
    // else if (field.type === 'calendar')
    //     return (
    //         <Calendar
    //             name={fieldName}
    //             label={field.label}
    //             value={field.value}
    //             error={field.error}
    //             required={field.required}
    //             disabled={field.disabled}
    //             onChange={onFieldChange}
    //         />
    //     );
    // else if (field.type === 'checkbox')
    //     return (
    //         <CheckBox
    //             name={fieldName}
    //             label={field.label}
    //             value={field.value}
    //             error={field.error}
    //             required={field.required}
    //             disabled={field.disabled}
    //             helperText={field.helperText}
    //             layoutClass={field.layoutClass}
    //             options={field.options || []}
    //             customField={field.customField}
    //             onChange={onFieldChange}
    //         />
    //     );
    // else if (field.type === 'chip')
    //     return (
    //         <ChipMenu
    //             name={fieldName}
    //             label={field.label}
    //             value={field.value}
    //             error={field.error}
    //             required={field.required}
    //             disabled={field.disabled}
    //             helperText={field.helperText}
    //             layoutClass={field.layoutClass}
    //             options={field.options || []}
    //             onChange={onFieldChange}
    //         />
    //     );
    // else if (field.type === 'file')
    //     return (
    //         <FileUpload
    //             name={fieldName}
    //             label={field.label}
    //             value={field.value}
    //             error={field.error}
    //             required={field.required}
    //             disabled={field.disabled}
    //             placeHolder={field.placeHolder}
    //             imageSize={field.imageSize}
    //             accept={field.accept}
    //             size={field.size}
    //             max={field.max}
    //             className={field.class}
    //             layoutClass={field.layoutClass}
    //             fileSize={field.fileSize}
    //             cropper={field.cropper}
    //             onChange={onFieldChange}
    //             icon={field.icon}
    //         />
    //     );
    // else if (field.type === 'multiTextField')
    //     return (
    //         <MultiField
    //             buttonText={field.buttonText}
    //             buttonSize={field.buttonSize}
    //             name={fieldName}
    //             label={field.label}
    //             form={form}
    //             required={field.required}
    //             disabled={field.disabled}
    //             placeHolder={field.placeHolder}
    //             type={field.type}
    //             size={field.size}
    //             rows={field.rows}
    //             min={field.min}
    //             max={field.max}
    //             className={field.class}
    //             layoutClass={field.layoutClass}
    //             format={field.format}
    //             initialFieldCount={field.initialFieldCount}
    //             remove={field.remove!}
    //             onChange={onFieldChange}
    //             startIcon={field.startIcon}
    //             endIcon={field.endIcon}
    //         />
    //     );
    // else if (field.type === 'radio')
    //     return (
    //         <RadioButton
    //             name={fieldName}
    //             label={field.label}
    //             value={field.value}
    //             error={field.error}
    //             required={field.required}
    //             disabled={field.disabled}
    //             helperText={field.helperText}
    //             layoutClass={field.layoutClass}
    //             options={field.options || []}
    //             customField={field.customField}
    //             onChange={onFieldChange}
    //         />
    //     );
    // else if (field.type === 'toggle')
    //     return (
    //         <Toggle
    //             name={fieldName}
    //             label={field.label}
    //             value={field.value}
    //             error={field.error}
    //             required={field.required}
    //             disabled={field.disabled}
    //             helperText={field.helperText}
    //             layoutClass={field.layoutClass}
    //             onChange={onFieldChange}
    //         />
    //     );
    else
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
                className={field.className}
                layoutClass={field.layoutClass}
                format={field.format}
                onChange={onFieldChange}
                startIcon={field.startIcon}
                endIcon={field.endIcon}
                noError={false}
                length={0}
            />
        );
};
