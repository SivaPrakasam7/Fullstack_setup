import { useContext, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

//
import { routes } from 'services/constants/routes';
import { generateKey } from 'services/repository/utils';
import { UserContext } from 'src/providers/context';
import { Logo } from '../components/logo';
import { Profile } from './components/profile';
import { Cookies } from '../components/cookies';

//
export default () => {
    const user = useContext(UserContext);
    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return (
        <div className="h-screen w-full flex flex-col gap-3">
            <div className="flex gap-2 px-5 py-4 w-full justify-between items-center">
                <button
                    className="text-xl font-bold flex gap-1 items-center"
                    onClick={() => navigate(routes.root)}
                >
                    <Logo className="w-8 h-8" /> {import.meta.env.VITE_APP_NAME}
                </button>
                {user?.signedIn ? (
                    <div className="flex gap-2 items-center">
                        <button
                            className="app-button border-transparent app-shadow"
                            onClick={() => navigate(routes.app)}
                        >
                            App
                        </button>
                        <Profile />
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <button
                            className="app-button"
                            onClick={() => navigate(routes.signIn)}
                        >
                            Sign In
                        </button>
                        <button
                            className="app-button app-shadow"
                            onClick={() => navigate(routes.signUp)}
                        >
                            Sign Up
                        </button>
                    </div>
                )}
            </div>
            <div className="flex flex-col gap-3 px-3 app-width">
                <Outlet />
            </div>
            <div className="min-h-24 flex-1 w-full" />
            <div className="py-10 border-t border-black/10 dark:border-white/10 px-5">
                <div className="flex flex-col sm:flex-row gap-5 justify-between max-w-screen-xl mx-auto">
                    <div className="flex flex-col gap-5">
                        <p className="text-xl font-bold flex gap-1 items-center">
                            <Logo className="w-8 h-8" />
                            {import.meta.env.VITE_APP_NAME}
                        </p>
                        <p className="text-black/50 dark:text-white/50">
                            © {new Date().getFullYear()} {import.meta.env.VITE}
                            . All rights reserved.
                        </p>
                    </div>
                    <div className="flex gap-5">
                        {[
                            {
                                title: 'Privacy policy',
                                link: routes.privacyPolicy,
                            },
                            {
                                title: 'Terms and condition',
                                link: routes.termsAndConditions,
                            },
                        ].map((content) => (
                            <button
                                key={generateKey()}
                                className="text-black/50 dark:text-white/50"
                                onClick={() => navigate(content.link)}
                            >
                                {content.title}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <Cookies />
        </div>
    );
};
