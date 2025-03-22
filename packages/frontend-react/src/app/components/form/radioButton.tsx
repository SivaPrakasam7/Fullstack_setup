import { IFormField } from './form.types';

//
export const RadioButton = ({
    label,
    name,
    helperText,
    value = '',
    error,
    disabled,
    size,
    required,
    layoutClass,
    options,
    className,
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
                className="block mb-1 text-sm text-gray-600 dark:text-white"
            >
                {label}
                {label && required && (
                    <span
                        v-show=""
                        className="text-gray-600/50 dark:text-white/50 font-bold text-xs"
                    >
                        *
                    </span>
                )}
            </label>
            <div className={`flex flex-wrap gap-3 mt-2 ${layoutClass}`}>
                {options?.map((option) => (
                    <div
                        v-for="(option, index) in options"
                        key={option.id}
                        className="flex flex-row items-center cursor-pointer w-fit"
                        onClick={() => handleInput(option.label)}
                    >
                        <input
                            type="radio"
                            name={name}
                            data-testid={name}
                            checked={value?.includes(option.label)}
                            className={`text-left mr-2 ${size}`}
                            disabled={disabled}
                        />
                        <span
                            className="text-sm"
                            dangerouslySetInnerHTML={{ __html: option.label }}
                        />
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
