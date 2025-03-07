import { ReactNode } from 'react';
import SvgIcon from './svg';

//
export const DialogView = ({
    open,
    close,
    children,
    contentClass,
    hideClose,
}: {
    children: ReactNode;
    open: boolean;
    close: () => void;
    contentClass?: string;
    hideClose?: boolean;
}) => {
    return (
        <div
            data-testid="DIALOG_BACKGROUND"
            className={`fixed top-0 left-1/2 -translate-x-1/2 no-scrollbar flex items-center justify-center overflow-hidden duration-500 bg-black bg-opacity-50 ${
                open
                    ? '!w-screen !h-screen opacity-100 z-40 backdrop-blur-sm'
                    : '!w-0 !h-0 !opacity-0 -z-0'
            }`}
            onClick={close}
        >
            <div
                className="no-scrollbar rounded-md max-h-[calc(100vh-50px)]"
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className={`w-full max-sm:w-[90dvw] h-auto rounded-2xl relative bg-white dark:bg-black border ${contentClass}`}
                >
                    {!hideClose && (
                        <button
                            className="text-gray-400 bg-white dark:bg-black app-button border !rounded-full !p-0 text-sm !w-8 !h-8 flex justify-center items-center absolute -top-3 -right-3"
                            onContextMenu={() => {
                                return false;
                            }}
                            onClick={close}
                        >
                            <SvgIcon
                                path="/icons/svg/close.svg"
                                className="w-5 h-5"
                            ></SvgIcon>
                        </button>
                    )}
                    <div className="overflow-hidden overflow-y-auto">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};
