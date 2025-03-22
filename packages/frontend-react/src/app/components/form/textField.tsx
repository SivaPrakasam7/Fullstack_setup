import {
    ChangeEvent,
    ClipboardEvent,
    KeyboardEvent,
    FormEvent,
    useMemo,
    useState,
    useRef,
    useEffect,
} from 'react';

//
import { getTagValues } from 'services/constants';

//
import SvgIcon from '../svg';
import { IFormField } from './form.types';

//
export const TextField = ({
    name,
    label,
    placeHolder,
    helperText,
    value,
    error,
    noError,
    disabled,
    type = 'text',
    min,
    max,
    size = 'p-3 text-md',
    rows,
    required,
    layoutClass,
    format: _,
    options = [],
    length = 4,
    startIcon,
    endIcon,
    onChange,
    onKeyPress,
    className,
    disableFilter = false,
    maxLength = 19,
}: Pick<
    IFormField,
    | 'label'
    | 'placeHolder'
    | 'helperText'
    | 'value'
    | 'error'
    | 'disabled'
    | 'min'
    | 'max'
    | 'size'
    | 'rows'
    | 'required'
    | 'layoutClass'
    | 'format'
    | 'options'
    | 'startIcon'
    | 'endIcon'
    | 'className'
    | 'noError'
    | 'length'
    | 'onChange'
    | 'disableFilter'
    | 'maxLength'
    | 'onKeyPress'
> &
    Required<Pick<IFormField, 'name' | 'type' | 'onChange'>>) => {
    const [show, setShow] = useState(
        ['date', 'datetime-local', 'time'].includes(type) || false
    );
    const [showMenu, setShowMenu] = useState(false);
    const [filterMenu, setFilterMenu] = useState(false);
    const [otp, setOTP] = useState<string[]>([]);
    const menuRef = useRef<HTMLUListElement>(null);

    //
    const filterOptions = useMemo(
        () =>
            type === 'select' || disableFilter
                ? options || []
                : options?.filter((option) =>
                      value && filterMenu
                          ? `${option.id} ${option.label}`
                                .toLowerCase()
                                .includes(`${value}`.toLowerCase())
                          : true
                  ) || [],
        [options?.length, value, disableFilter]
    );

    //
    const handleInput = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        if (['autocomplete', 'select'].includes(type)) {
            setShowMenu(true);
            setFilterMenu(true);
        }
        onChange({
            name,
            value: e.target.value,
        });
    };

    const handleInputChange = (
        event: FormEvent<HTMLInputElement>,
        index: number
    ) => {
        const target = event.target as unknown as { value: string };
        const otpInputs = document.querySelectorAll(
            `[data-ref="${name}-otpInputs"]`
        ) as unknown as HTMLInputElement[];
        if (/^\d$/.test(target.value)) {
            setOTP((_otp) => {
                _otp[index] = target.value;
                return _otp;
            });
            onChange({
                name,
                value: Object.values(otp).join(''),
            });
            if (
                (event as unknown as { inputType: string }).inputType ===
                    'deleteContentBackward' &&
                index > 0
            ) {
                setOTP((_otp) => {
                    _otp[index] = '';
                    return _otp;
                });
                const previousInput = otpInputs[index - 1];
                if (previousInput) {
                    previousInput.focus();
                }
            } else if (index < otpInputs.length - 1) {
                const nextInput = otpInputs[index + 1];
                if (nextInput) {
                    nextInput.focus();
                }
            }
        } else if (
            (event as unknown as { key: string }).key === 'Backspace' &&
            index > 0
        ) {
            setOTP((_otp) => {
                _otp[index] = '';
                return _otp;
            });
            const previousInput = otpInputs[index - 1];
            if (previousInput) {
                previousInput.focus();
            }
        } else {
            (event.target as unknown as { value: string }).value = '';
        }
    };

    const handleKeyDown = (
        event: KeyboardEvent<HTMLInputElement>,
        index: number
    ) => {
        const otpInputs = document.querySelectorAll(
            `[data-ref="${name}-otpInputs"]`
        ) as unknown as HTMLInputElement[];
        if (index > 0 && event.key === 'Backspace' && !otpInputs[index].value) {
            const previousInput = otpInputs[index - 1];
            if (previousInput) {
                previousInput.focus();
            }
        }
    };

    const limitInput = (event: ChangeEvent<HTMLInputElement>) => {
        const target = event.target as HTMLInputElement;
        if (type === 'number' && target.value.length >= maxLength) {
            target.value = target.value.slice(0, maxLength);
            onChange({
                name,
                value: target.value,
            });
        }
    };

    const filterNumericInput = (event: KeyboardEvent<HTMLInputElement>) => {
        onKeyPress?.(event);
        if (type === 'number') {
            const char = String.fromCharCode(event.charCode);
            if (
                !/[0-9\\.]/.test(char) &&
                ![8, 9, 13, 37, 39].includes(event.charCode)
            ) {
                event.preventDefault();
            }
        }
    };

    const filterPaste = (event: ClipboardEvent<HTMLInputElement>) => {
        if (type === 'number') {
            const pasteData = event.clipboardData?.getData('text');
            if (pasteData && !/^\d+$/.test(pasteData)) {
                event.preventDefault();
            }
        }
    };

    const toggle = () => {
        setShow((prev) => !prev);
    };

    const toggleMenu = () => {
        if (['autocomplete', 'select'].includes(type)) {
            setShowMenu((prev) => !prev);
            setFilterMenu(false);
            if (showMenu)
                setTimeout(() => {
                    document.removeEventListener('click', handleOutsideClick);
                    document.addEventListener('click', handleOutsideClick);
                }, 100);
            else document.removeEventListener('click', handleOutsideClick);
        }
    };

    const handleOutsideClick = () => {
        if (showMenu) {
            setShowMenu(false);
            setFilterMenu(false);
            onChange({
                name,
                value,
            });
            document.removeEventListener('click', handleOutsideClick);
        }
    };

    const selectOption = (value: string) => {
        onChange({ name, value, id: true });
        setShowMenu(false);
        setFilterMenu(false);
        document.removeEventListener('click', handleOutsideClick);
    };

    const focus = () => {
        if (['date', 'datetime-local', 'time'].includes(type)) setShow(false);
    };

    const blur = () => {
        if (['date', 'datetime-local', 'time'].includes(type)) setShow(true);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                showMenu &&
                menuRef.current &&
                event.target &&
                !menuRef.current?.contains(event.target as Node)
            ) {
                setShowMenu(false);
                setFilterMenu(false);
            }
        };

        if (showMenu)
            document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label
                    htmlFor={name}
                    className="block mb-1 text-sm text-gray-600 dark:text-white"
                >
                    {label}
                    {label && required && (
                        <span className="text-gray-600/50 dark:text-white/50 font-bold text-xs">
                            *
                        </span>
                    )}
                </label>
            )}
            {type === 'otp' ? (
                <div
                    className={`flex gap-3 justify-between  w-fit ${layoutClass}`}
                >
                    {new Array(length).fill(null).map((_, i) => (
                        <input
                            key={i + 1}
                            data-ref={`${name}-otpInputs`}
                            name={name + i + 1}
                            data-testid={name + i + 1}
                            type={type}
                            placeholder={placeHolder}
                            disabled={disabled}
                            className={`text-md rounded-md outline-none bg-transparent text-center w-10 h-10 app-inner-shadow ${size} ${
                                disabled
                                    ? 'bg-gray-400 text-gray-400 dark:text-gray-300'
                                    : 'border border-transparent hover:border-gray-500'
                            }`}
                            maxLength={1}
                            onInput={(e) => handleInputChange(e, i)}
                            onKeyDown={(e) => handleKeyDown(e, i)}
                        />
                    ))}
                </div>
            ) : (
                <div
                    className={`flex text-md border border-transparent hover:border-gray-500 text-md w-full rounded-xl relative items-center gap-1 transition-border duration-300 app-inner-shadow ${layoutClass} ${disabled ? 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-300' : ''}`}
                >
                    {startIcon}
                    {['date', 'datetime-local'].includes(type) && (
                        <SvgIcon
                            path="/icons/svg/calendar.svg"
                            className="!w-5 !h-5 m-auto ml-3 !text-current"
                        ></SvgIcon>
                    )}
                    {type === 'time' && (
                        <SvgIcon
                            path="/icons/svg/time.svg"
                            className="!w-5 !h-5 m-auto ml-3 !text-current"
                        ></SvgIcon>
                    )}
                    {type === 'textarea' ? (
                        <textarea
                            data-testid={name}
                            name={name}
                            placeholder={placeHolder}
                            disabled={disabled}
                            rows={rows}
                            className={`w-full rounded-xl outline-none bg-transparent ${size}`}
                            style={{ resize: 'none' }}
                            onChange={handleInput}
                            value={value}
                        />
                    ) : (
                        <input
                            data-testid={name}
                            name={name}
                            type={
                                ['autocomplete', 'select'].includes(type)
                                    ? 'text'
                                    : show
                                      ? 'text'
                                      : type
                            }
                            placeholder={placeHolder}
                            disabled={disabled || type === 'select'}
                            min={min}
                            max={max}
                            // format={format}
                            className={`text-md w-full rounded-xl outline-none bg-transparent ${size}`}
                            autoComplete="off"
                            onInput={limitInput}
                            onKeyPress={filterNumericInput}
                            onPaste={filterPaste}
                            onFocus={focus}
                            onBlur={blur}
                            onClick={toggleMenu}
                            onChange={handleInput}
                            value={
                                ['autocomplete', 'select'].includes(type) &&
                                value
                                    ? options.find((o) => o.id === value)?.label
                                    : value
                            }
                        />
                    )}
                    {type === 'select' && (
                        <div
                            data-testid={`${name}-select`}
                            className="absolute top-0 left-0 w-full h-full"
                            onClick={toggleMenu}
                        ></div>
                    )}
                    {type === 'password' && (
                        <button
                            type="button"
                            className="mr-3"
                            onContextMenu={() => {
                                return false;
                            }}
                            onClick={toggle}
                        >
                            {show ? (
                                <SvgIcon
                                    path="/icons/svg/visibility.svg"
                                    className="!h-5 !w-5 !text-current"
                                ></SvgIcon>
                            ) : (
                                <SvgIcon
                                    path="/icons/svg/visibility_off.svg"
                                    className="!h-5 !w-5 !text-current"
                                ></SvgIcon>
                            )}
                        </button>
                    )}
                    {['autocomplete', 'select'].includes(type) && (
                        <button
                            type="button"
                            className="mr-3"
                            onContextMenu={() => {
                                return false;
                            }}
                            onClick={toggleMenu}
                        >
                            <SvgIcon
                                path="/icons/svg/arrow.svg"
                                className={`!h-3 !w-3 !text-current transition-transform duration-300 ${showMenu ? '' : 'rotate-180'}`}
                            ></SvgIcon>
                        </button>
                    )}
                    {endIcon}
                    {['autocomplete', 'select'].includes(type) && showMenu && (
                        <ul
                            ref={menuRef}
                            data-testid={`${name}-menu`}
                            className="absolute bg-gray-100 dark:bg-neutral-900 border rounded-lg w-full max-h-32 h-fit overflow-auto z-10 top-[100%] max-md:fixed max-md:left-[50%] max-md:top-[50%] max-md:-translate-x-[50%] max-md:-translate-y-[50%] max-md:max-w-sm max-sm:w-[90%]"
                        >
                            {filterOptions.map((option, index) => (
                                <li
                                    key={index}
                                    data-testid={`${name}-option`}
                                    className="app-menu-item capitalize"
                                    onClick={() => selectOption(option.id)}
                                >
                                    {option.label}
                                </li>
                            ))}
                            {filterOptions.length === 0 && (
                                <li
                                    className="app-menu-item"
                                    onClick={() => selectOption('')}
                                >
                                    No options found
                                </li>
                            )}
                        </ul>
                    )}
                </div>
            )}
            {!noError && (
                <p
                    data-testid={`${name}-error`}
                    className={`mt-1 text-xs italic min-h-4 ${error ? 'text-red-500' : 'text-gray-400'}`}
                >
                    {type === 'tag' && (
                        <>
                            <span
                                data-testid={`${name}-error`}
                                className="mt-1 text-xs italic min-h-4 text-gray-400"
                            >
                                separated by commas, semicolons, or newlines
                            </span>
                            <br />
                        </>
                    )}
                    {error || helperText}
                </p>
            )}
            {type === 'tag' && (
                <div className="block max-h-20 overflow-y-auto no-scrollbar">
                    {getTagValues(value).map((tag) => (
                        <p
                            key={tag}
                            className="text-xs rounded-full border w-fit px-2 pb-0.5 m-0.5 truncate max-w-[250px] float-left"
                        >
                            {tag}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
};
