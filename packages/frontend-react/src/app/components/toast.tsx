import SvgIcon from './svg';

//
const Toast = ({
    type,
    message,
    close,
}: {
    type: 'info' | 'error' | 'warning' | 'success';
    message: string;
    close: () => void;
}) => (
    <div
        data-testid="TOAST"
        className={`flex items-center max-w-[400px] w-full p-2 mb-4 rounded-lg shadow-2xl ${
            type === 'success'
                ? 'bg-green-100'
                : type === 'error'
                  ? 'bg-red-100'
                  : type === 'warning'
                    ? ' bg-orange-100'
                    : ' bg-blue-100'
        }`}
        role="alert"
    >
        {
            {
                info: (
                    <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-blue-500 bg-blue-100 rounded-lg dark:bg-blue-800 dark:text-blue-200">
                        <SvgIcon
                            path="/icons/svg/info.svg"
                            className="h-6 w-6"
                        ></SvgIcon>
                    </div>
                ),
                error: (
                    <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-red-500 bg-red-100 rounded-lg dark:bg-red-800 dark:text-red-200">
                        <SvgIcon
                            path="/icons/svg/error.svg"
                            className="h-6 w-6"
                        ></SvgIcon>
                    </div>
                ),
                warning: (
                    <div
                        v-if="toast.type === 'warning'"
                        className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-orange-500 bg-orange-100 rounded-lg dark:bg-orange-700 dark:text-orange-200"
                    >
                        <SvgIcon
                            path="/icons/svg/warning.svg"
                            className="h-6 w-6"
                        ></SvgIcon>
                    </div>
                ),
                success: (
                    <div
                        v-if="toast.type === 'success'"
                        className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200"
                    >
                        <SvgIcon
                            path="/icons/svg/check_circle.svg"
                            className="h-6 w-6"
                        ></SvgIcon>
                    </div>
                ),
            }[type]
        }
        <div
            className={`mx-3 text-sm font-normal ${
                type === 'success'
                    ? 'text-green-500'
                    : type === 'error'
                      ? 'text-red-500'
                      : type === 'warning'
                        ? ' text-orange-500'
                        : ' text-blue-500'
            }`}
        >
            {message}
        </div>
        <button
            className="ms-auto -mx-1.5 -my-1.5 text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 f p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8"
            data-dismiss-target="#toast-success"
            aria-label="Close"
            onContextMenu={() => {
                return false;
            }}
            onClick={close}
        >
            <SvgIcon path="/icons/svg/close.svg" className="h-6 w-6"></SvgIcon>
        </button>
    </div>
);

export default Toast;
