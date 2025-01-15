import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SvgIcon from 'src/app/components/svg';

//
export default () => {
    const [response, _setResponse] = useState<{
        error: boolean;
        message: string;
    }>();
    const navigate = useNavigate();

    const goToHome = () => {
        navigate(import.meta.env.BASE_URL);
    };

    return (
        <div className="flex flex-col gap-5 items-center justify-center h-screen w-screen">
            <h1
                data-testId="MESSAGE"
                className={`text-3xl font-bold flex gap-2 items-center justify-center ${response?.error ? 'text-red-500' : 'text-green-500'}`}
            >
                <SvgIcon
                    path="/icons/svg/error.svg"
                    className="h-8 w-8"
                ></SvgIcon>
                {response?.message}
            </h1>
            <button className="app-button" onClick={goToHome}>
                Home
            </button>
        </div>
    );
};
