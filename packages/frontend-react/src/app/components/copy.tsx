import { ReactNode, useState } from 'react';
import SvgIcon from './svg';
import copy from 'copy-to-clipboard';

export const Copy = ({
    content,
    children,
}: {
    content: string;
    children: ReactNode;
}) => {
    const [state, setState] = useState(false);

    const contentCopy = () => {
        copy(content);
        setState(true);
        setTimeout(() => {
            setState(false);
        }, 3000);
    };

    return (
        <div className="flex items-center">
            {children}
            <span onClick={contentCopy}>
                {state ? (
                    <SvgIcon
                        path="/icons/svg/app/check.svg"
                        className="w-5 h-5 text-green-500"
                    />
                ) : (
                    <SvgIcon
                        path="/icons/svg/app/copy.svg"
                        className="w-5 h-5 text-gray-500"
                    />
                )}
            </span>
        </div>
    );
};
