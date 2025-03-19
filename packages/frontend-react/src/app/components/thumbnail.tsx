import { useState } from 'react';
import SvgIcon from './svg';

export const Thumbnail = ({
    url,
    className = 'w-16 h-16',
}: {
    url: string;
    className?: string;
}) => {
    const [imageError, setImageError] = useState(false);

    return imageError ? (
        <SvgIcon path="/icons/svg/file.svg" className={className} />
    ) : (
        <img
            src={url}
            className={className}
            onError={() => {
                setImageError(true);
            }}
        />
    );
};
