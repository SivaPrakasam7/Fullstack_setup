import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

//
import { routes } from 'services/constants/routes';
import { logout } from 'services/repository/authentication';
import { UserContext } from 'src/providers/context';
import { Profile } from './components/profile';

//
export default () => {
    const user = useContext(UserContext);
    const navigate = useNavigate();

    const goToSignIn = () => {
        navigate(routes.signIn);
    };

    const goToSignUp = () => {
        navigate(routes.signUp);
    };

    const _logout = async () => {
        await logout();
        user.updateUser();
    };

    return (
        <div className="flex flex-col gap-5 items-center justify-center h-screen w-screen">
            {user?.signedIn && (
                <div className="fixed top-2 right-2">
                    <Profile />
                </div>
            )}
            <h1 data-testid="INIT" className="text-3xl font-bold">
                {import.meta.env.VITE_APP_NAME}
            </h1>
            <p>
                {user?.signedIn
                    ? `${user?.name} logged in successfully`
                    : 'User need to login'}
            </p>
            {user?.signedIn ? (
                <button className="app-button" onClick={_logout}>
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
