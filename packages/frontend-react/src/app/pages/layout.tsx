import { useContext } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

//
import { routes } from 'services/constants/routes';
import { Profile } from './components/profile';
import { UserContext } from 'src/providers/context';

//
export default () => {
    const user = useContext(UserContext);
    const navigate = useNavigate();

    return (
        <div className="h-screen w-full">
            <div className="flex gap-2 px-5 py-4 w-full justify-between items-center">
                <button
                    className="text-xl font-bold"
                    onClick={() => navigate(routes.root)}
                >
                    {import.meta.env.VITE_APP_NAME}
                </button>
                {user?.signedIn && (
                    <div className="flex gap-2 items-center">
                        <button
                            className="app-button"
                            onClick={() => navigate(routes.app)}
                        >
                            App
                        </button>
                        <Profile />
                    </div>
                )}
            </div>
            <Outlet />
        </div>
    );
};
