import { useNavigate } from 'react-router-dom';

//
export const CommonPage = ({ content }: { content: string }) => {
    const navigate = useNavigate();

    const goToHome = () => {
        navigate(import.meta.env.BASE_URL);
    };

    return (
        <div className="flex flex-col gap-5 items-center justify-center h-screen app-width">
            <h1 data-testid="INIT" className="text-3xl font-bold">
                {content}
            </h1>
            <button className="app-button" onClick={goToHome}>
                Home
            </button>
        </div>
    );
};
