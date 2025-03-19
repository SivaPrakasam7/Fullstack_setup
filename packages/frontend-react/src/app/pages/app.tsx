import { useNavigate } from 'react-router-dom';

//
import { CodeBlock } from './demos/codeBlock';
import { FormDemo } from './demos/formDemo';
import { routes } from 'services/constants/routes';

//
export default () => {
    const navigate = useNavigate();

    return (
        <div className="max-w-screen-md app-width mx-auto px-4 py-8 flex flex-col gap-8">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
                Pages Showcase
            </h1>
            <section className="block">
                <button
                    className="app-button whitespace-nowrap float-left m-2 app-shadow"
                    onClick={() => navigate(routes.signIn)}
                >
                    Sign In
                </button>
                <button
                    className="app-button whitespace-nowrap float-left m-2 app-shadow"
                    onClick={() => navigate(routes.signUp)}
                >
                    Sign Up
                </button>
                <button
                    className="app-button whitespace-nowrap float-left m-2 app-shadow"
                    onClick={() => navigate(routes.forgotPassword)}
                >
                    Forgot password
                </button>
                <button
                    className="app-button whitespace-nowrap float-left m-2 app-shadow"
                    onClick={() =>
                        navigate(
                            routes.resetPassword + '?token=EMAIL_TOKEN_HERE'
                        )
                    }
                >
                    Reset password
                </button>
                <button
                    className="app-button whitespace-nowrap float-left m-2 app-shadow"
                    onClick={() => navigate(routes.maintenance)}
                >
                    Maintenance
                </button>
                <button
                    className="app-button whitespace-nowrap float-left m-2 app-shadow"
                    onClick={() => navigate(routes['404'])}
                >
                    404
                </button>
            </section>

            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 tracking-tight mt-10">
                Components Showcase
            </h1>
            <section className="flex flex-col gap-4">
                <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
                    Code Block
                </h2>
                <CodeBlock />
            </section>
            <section className="flex flex-col gap-4">
                <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
                    Form Demo
                </h2>
                <FormDemo />
            </section>
        </div>
    );
};
