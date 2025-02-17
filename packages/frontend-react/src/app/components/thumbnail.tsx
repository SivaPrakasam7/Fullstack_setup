export const Thumbnail = ({
    url,
    className = 'w-16 h-16',
}: {
    url: string;
    className?: string;
}) => {
    return (
        <img
            src={url}
            className={className}
            onError={(e) => {
                e.currentTarget.src = '/icons/svg/app/file.svg';
                e.currentTarget.style.padding = '10px';
            }}
        />
    );
};
