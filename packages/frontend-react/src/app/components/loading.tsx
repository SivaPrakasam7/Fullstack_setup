import { Logo } from './logo';

export const Loading = () => {
    return (
        <div className="fixed top-0 left-0 app-width h-screen flex items-center justify-center bg-white dark:bg-black">
            <Logo />
        </div>
    );
};
