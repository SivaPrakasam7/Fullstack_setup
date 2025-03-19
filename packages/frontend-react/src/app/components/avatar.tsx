export const Avatar = ({
    name,
    image,
    onClick,
    className = 'p-2 w-10 h-10',
}: {
    name: string;
    image?: string;
    onClick?: () => void;
    className?: string;
}) => {
    return (
        <div
            data-testid="avatar"
            className={`app-shadow rounded-full dark:bg-transparent bg-gray-100 flex items-center justify-center text-xl overflow-hidden ${className}`}
            onClick={onClick}
        >
            {image ? (
                <img
                    src={image}
                    className="w-full h-full object-cover rounded-full"
                />
            ) : (
                <>
                    {name
                        .split(' ')
                        .map((n) => n[0].toUpperCase())
                        .slice(0, 2)
                        .join('')}
                </>
            )}
        </div>
    );
};
