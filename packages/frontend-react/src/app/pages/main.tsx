import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

//
import { UserContext } from 'src/providers/context';
import { logout } from 'src/repository/authentication';

//
export default () => {
    const user = useContext(UserContext);
    const navigate = useNavigate();

    const goToSignIn = () => {
        navigate('/sign-in');
    };

    const goToSignUp = () => {
        navigate('/sign-up');
    };

    return (
        <div className="flex flex-col gap-5 items-center justify-center h-screen w-screen">
            <h1 data-testid="INIT" className="text-3xl font-bold">
                {import.meta.env.VITE_APP_NAME}
            </h1>
            <p>
                {user?.signedId
                    ? `${user?.name} logged in successfully`
                    : 'User need to login'}
            </p>
            {user?.signedId ? (
                <button className="app-button" onClick={logout}>
                    Logout
                </button>
            ) : (
                <div className="flex gap-2">
                    <button className="app-button" onClick={goToSignIn}>
                        Sign In
                    </button>
                    <button className="app-button" onClick={goToSignUp}>
                        Sign Up
                    </button>
                </div>
            )}
        </div>
    );
};
