export const Avatar = ({
    name,
    onClick,
}: {
    name: string;
    onClick?: () => void;
}) => {
    return (
        <div
            className="border rounded-full p-2 w-10 h-10 bg-gray-100 flex items-center justify-center text-lg"
            onClick={onClick}
        >
            {name
                .split(' ')
                .map((n) => n[0].toUpperCase())
                .slice(0, 2)
                .join('')}
        </div>
    );
};
