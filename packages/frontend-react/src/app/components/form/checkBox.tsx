import { IFormField } from './form.types';

//
export const CheckBox = ({
    label,
    name,
    helperText,
    value,
    error,
    disabled,
    size,
    required,
    layoutClass,
    options,
    className,
    customField,
    onChange,
}: Pick<
    IFormField,
    | 'label'
    | 'helperText'
    | 'value'
    | 'error'
    | 'disabled'
    | 'size'
    | 'required'
    | 'layoutClass'
    | 'options'
    | 'className'
    | 'customField'
> &
    Required<Pick<IFormField, 'name' | 'onChange'>>) => {
    const handleInput = (option: string) => {
        const _value = option;
        onChange({
            name,
            value: _value === value ? undefined : _value,
        });
    };

    return (
        <div className={`w-full ${className}`}>
            <label
                htmlFor={name}
                className="block mb-1 text-sm font-bold text-gray-600 dark:text-white"
            >
                {label}
                {label && required && (
                    <span v-show="" className="text-red-400 font-bold text-xs">
                        *
                    </span>
                )}
            </label>
            <div className={`flex flex-wrap gap-3 mt-2 ${layoutClass}`}>
                {options?.map((option, index) => (
                    <div
                        v-for="(option, index) in options"
                        key={option.id}
                        className="flex flex-row items-center"
                    >
                        <input
                            type="checkbox"
                            name={name}
                            data-testid={name}
                            checked={value?.includes(option.label)}
                            className={`text-left mr-2 ${size}`}
                            onClick={() => handleInput(option.label)}
                            disabled={disabled}
                        />
                        <span
                            className="text-sm"
                            dangerouslySetInnerHTML={{ __html: option.label }}
                        />
                        {customField && index === options.length - 1 && (
                            <input
                                v-if=""
                                type="text"
                                className="outline-none border-b-[1px] border-b-gray-600 w-full"
                                disabled={
                                    disabled || !value?.includes(option.label)
                                }
                                onChange={(e) => {
                                    if (value?.includes(option.label))
                                        handleInput(
                                            `${e.target.value} ${option.label}`
                                        );
                                }}
                            />
                        )}
                    </div>
                ))}
            </div>
            <p
                data-testid={`${name}-error`}
                className={`mt-1 text-xs italic min-h-4 ${error ? 'text-red-500' : 'text-gray-400'}`}
            >
                {error || helperText}
            </p>
        </div>
    );
};
