import { ChangeEvent, DragEvent, useEffect, useState } from 'react';

//
import { DialogView } from '../dialog';
import { IFormField } from './form.types';
import { byteFormat, formatAcceptTypes } from 'services/repository/utils';
import { CropperView } from '../cropper';
import SvgIcon from '../svg';
import { Thumbnail } from '../thumbnail';

//
export const FileUpload = ({
    name,
    label,
    helperText,
    error,
    disabled,
    max = '1',
    size = 'p-3 text-md',
    required,
    layoutClass,
    className,
    onChange,
    accept = 'image/png,image/jpg,image/jpeg',
    multiple,
    cropper = false,
    fileSize = 52428800,
    imageSize = 'h-24 w-24',
    icon,
    value = [],
}: Pick<
    IFormField,
    | 'label'
    | 'helperText'
    | 'value'
    | 'error'
    | 'disabled'
    | 'max'
    | 'size'
    | 'required'
    | 'layoutClass'
    | 'className'
    | 'onChange'
    | 'accept'
    | 'multiple'
    | 'cropper'
    | 'fileSize'
    | 'imageSize'
    | 'icon'
> &
    Required<Pick<IFormField, 'name' | 'onChange'>>) => {
    const [files, setFiles] = useState<File[]>([]);
    const [localFile, setLocalFile] = useState('');
    const [selectedFile, setSelectedFile] = useState<File>();
    const [showCropper, setCropper] = useState(false);
    const [isDragging, setDrag] = useState(false);
    const [localError, setLocalError] = useState('');

    const handleDrag = () => {
        setDrag((prev) => !prev);
    };

    const onDrop = (event: DragEvent<HTMLLabelElement>) => {
        setDrag(false);
        if (!disabled) {
            event.preventDefault();
            event.stopPropagation();
            loadFile({
                target: { files: event.dataTransfer!.files },
            } as ChangeEvent<HTMLInputElement>);
        }
    };

    const loadFile = async (event: ChangeEvent<HTMLInputElement>) => {
        const files = [];
        setLocalError('');
        const fileInput = event.target;

        if (fileInput.files && fileInput.files.length > 0) {
            if (fileInput.files.length <= +max) {
                for (const file of fileInput.files) {
                    const acceptFileRegex = new RegExp(
                        accept.replace(/,\s?/g, '|')
                    );
                    if (acceptFileRegex.test(file.type || '')) {
                        if (file.size > fileSize)
                            setLocalError(
                                `Upload limit maximum ${byteFormat(fileSize, 0)} allowed`
                            );
                        else {
                            if (cropper) {
                                setLocalFile(getObjectURL(file));
                                setSelectedFile(file);
                                setCropper(true);
                            } else {
                                files.push(file);
                                onChange?.({
                                    name,
                                    value: files,
                                });
                            }
                        }
                    } else {
                        setLocalError(`${file.name} file format is invalid`);
                    }
                }
            } else setLocalError(`Maximum allowed files : ${max}`);
        }
        setFiles(files);
        fileInput.value = '';
    };

    const getObjectURL = (file: File | string) => {
        return typeof file === 'string' ? file : URL.createObjectURL(file);
    };
    const removeLocalImages = (index: number) => {
        setFiles((prev) => {
            const files = prev;

            return files.filter((_, i) => i !== index);
        });
        onChange?.({
            name,
            value: files,
        });
    };

    const toggleCropper = () => {
        setCropper((prev) => !prev);

        if (!showCropper) {
            setLocalFile('');
            setSelectedFile(undefined);
        }
    };

    const callback = (image: Blob) => {
        setCropper(false);
        const file = new File([image], selectedFile!.name, {
            type: 'image/png',
        });
        setSelectedFile(file);
        setFiles([file]);
        onChange?.({
            name,
            value: [file],
        });
    };

    useEffect(() => {
        setFiles(value);
    }, [value.length]);

    return (
        <div className={`w-full ${className}`}>
            <input
                id={`${name}-browse`}
                data-testid={name}
                name={name}
                type="file"
                accept={accept}
                disabled={disabled}
                multiple={multiple}
                hidden
                onChange={loadFile}
            />
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
            <div
                className={`w-full grid grid-cols-2 gap-1 items-end ${layoutClass}`}
            >
                <label
                    htmlFor={`${name}-browse`}
                    className={`flex flex-col gap-1 items-center justify-center rounded-lg cursor-pointer h-full app-inner-shadow ${size} ${
                        disabled
                            ? 'shadow-[_0px_0px_20px_inset] shadow-gray-400'
                            : isDragging
                              ? ' shadow-[_0px_0px_20px_inset] shadow-green-500'
                              : ''
                    }`}
                    onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDrag();
                    }}
                    onDragLeave={handleDrag}
                    onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDrop(e);
                    }}
                >
                    {icon}
                    <p className="text-sm text-gray-400 text-center">
                        Drag & Drop
                        <br />
                        <span className="text-themeColorAlternate">
                            or browse
                        </span>
                    </p>
                </label>
                <div className="block">
                    {files.map((image, index) => (
                        <div
                            key={index}
                            data-title={image.name}
                            data-testid="SELECTED_FILE"
                            className={`float-left m-1 relative border border-gray-300 rounded-lg ${imageSize}`}
                        >
                            <Thumbnail
                                url={getObjectURL(image)}
                                className={`rounded-lg border-white object-cover pointer-events-none ${imageSize}`}
                            />
                            <p className="text-[10px] absolute bottom-0 right-0 bg-white px-3 py-1 rounded-full text-black">
                                {image.name}
                            </p>
                            <button
                                aria-label="close-information"
                                data-testid="REMOVE_FILE"
                                type="button"
                                className="text-gray-400 bg-white dark:bg-black app-button border border-blue-200 !rounded-full !p-0 text-sm !w-6 !h-6 flex justify-center items-center absolute -top-2 -right-2 z-50"
                                onClick={() => removeLocalImages(index)}
                            >
                                <SvgIcon
                                    path="/icons/svg/close.svg"
                                    className="w-5 h-5"
                                ></SvgIcon>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            <p
                data-testid="`${name}-error`"
                className={`mt-1 text-xs italic min-h-4 ${error || localError ? 'text-red-500' : 'text-gray-400'}`}
            >
                {localError ||
                    error ||
                    helperText ||
                    `File types ${formatAcceptTypes(accept)}. Upload limit maximum ${byteFormat(fileSize, 0)} allowed`}
            </p>
            <DialogView
                open={showCropper}
                close={toggleCropper}
                hideClose={true}
            >
                <CropperView
                    image={localFile}
                    close={toggleCropper}
                    callback={callback}
                />
            </DialogView>
        </div>
    );
};
