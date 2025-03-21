import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

//
import { routes } from 'services/constants/routes';
import { verifyEmailAccount } from 'services/repository/authentication';
import SvgIcon from 'src/app/components/svg';

//
export default () => {
    const [response, setResponse] = useState<{
        error: boolean;
        message: string;
    }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    //
    useEffect(() => {
        const token = searchParams.get('token') as string;
        if (!token) {
            navigate(routes.root);
        } else
            verifyEmailAccount(token).then((res) => {
                setResponse(res);
            });
    }, [searchParams.get('token')]);

    //
    const goToHome = () => {
        navigate(routes.root);
    };

    return (
        <div className="flex flex-col gap-5 items-center justify-center app-height app-width">
            <h1
                data-testid="MESSAGE"
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
