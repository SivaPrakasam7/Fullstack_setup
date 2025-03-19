import { lazy, ReactNode, useContext } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';

//
import { routes } from 'services/constants/routes';
import { UserContext } from 'src/providers/context';
import { CommonPage } from 'src/app/components/page';
import { Loading } from 'src/app/components/loading';

//
const Private = ({
    protect,
    children,
}: {
    children: ReactNode;
    protect?: boolean;
}) => {
    const user = useContext(UserContext);

    if (user?.loading) return <Loading />;

    if (
        (Boolean(user?.signedIn) && protect) ||
        (Boolean(!user?.signedIn) && !protect)
    ) {
        return <>{children}</>;
    }

    return <Navigate to={import.meta.env.BASE_URL} />;
};

//
const Layout = lazy(() => import('src/app/pages/layout'));
const MainPage = lazy(() => import('src/app/pages/main'));
const SignInPage = lazy(() => import('src/app/pages/authentication/signIn'));
const SignUpPage = lazy(() => import('src/app/pages/authentication/signUp'));
const ForgotPasswordPage = lazy(
    () => import('src/app/pages/authentication/forgotPassword')
);
const ResetPasswordPage = lazy(
    () => import('src/app/pages/authentication/resetPassword')
);
const VerificationPage = lazy(
    () => import('src/app/pages/authentication/verification')
);
const AppPage = lazy(() => import('src/app/pages/app'));
const SettingsPage = lazy(() => import('src/app/pages/settings'));
const PrivacyPolicy = lazy(() => import('src/app/pages/privacyPolicy'));
const TermsAndConditions = lazy(
    () => import('src/app/pages/termsAndCondition')
);

const Router = () =>
    useRoutes([
        {
            path: routes.root,
            element: <Layout />,
            children: [
                {
                    path: routes.root,
                    element: <MainPage />,
                },
                {
                    path: routes.signIn,
                    element: (
                        <Private>
                            <SignInPage />
                        </Private>
                    ),
                },
                {
                    path: routes.signUp,
                    element: (
                        <Private>
                            <SignUpPage />
                        </Private>
                    ),
                },
                {
                    path: routes.forgotPassword,
                    element: (
                        <Private>
                            <ForgotPasswordPage />
                        </Private>
                    ),
                },
                {
                    path: routes.resetPassword,
                    element: (
                        <Private>
                            <ResetPasswordPage />
                        </Private>
                    ),
                },
                {
                    path: routes.verify,
                    element: (
                        <Private>
                            <VerificationPage />
                        </Private>
                    ),
                },
                {
                    path: routes.app,
                    element: <AppPage />,
                },
                {
                    path: routes.settings,
                    element: (
                        <Private protect>
                            <SettingsPage />
                        </Private>
                    ),
                },
                {
                    path: routes.privacyPolicy,
                    element: <PrivacyPolicy />,
                },
                {
                    path: routes.termsAndConditions,
                    element: <TermsAndConditions />,
                },
                {
                    path: '*',
                    element: <CommonPage content="404 Page Not Found" />,
                },
            ],
        },
    ]);

export default Router;
