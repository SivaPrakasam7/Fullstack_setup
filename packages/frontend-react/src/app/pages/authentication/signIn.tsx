import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

//
import { emailRegex } from 'services/constants/regex';
import { routes } from 'services/constants/routes';
import { login } from 'services/repository/authentication';
import { IFormField } from 'src/app/components/form/form.types';
import { FormBuilder } from 'src/app/components/form/main';
import { UserContext } from 'src/providers/context';

//
const form = {
    email: {
        label: 'Email',
        placeHolder: 'Enter your email',
        type: 'text',
        required: true,
        value: '',
        requiredLabel: 'Please enter your email',
        validations: [
            {
                type: 'regex',
                validate: emailRegex,
                message: 'Invalid email',
            },
        ],
    },
    password: {
        label: 'Password',
        placeHolder: 'Enter your password',
        type: 'password',
        required: true,
        value: '',
        requiredLabel: 'Please enter your password',
    },
} as Record<string, IFormField>;

export default () => {
    const navigate = useNavigate();
    const user = useContext(UserContext);

    //
    const call = async (payload: ILargeRecord) => {
        const res = await login(payload);
        if (!res.error) {
            user.updateUser();
            navigate(routes.root);
        }
        return !res.error;
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen w-screen">
            <div className="max-w-[400px] w-full flex flex-col gap-2 p-2">
                <p className="text-4xl font-bold">Sign In</p>
                <FormBuilder
                    form={form}
                    call={call}
                    buttonText="Sign In"
                    layoutClass="gap-1"
                />
                <div className="w-full border-t border-gray-600"></div>
                <div className="flex flex-row justify-between">
                    <a
                        onClick={() => navigate(routes.signUp)}
                        className="text-md underline text-gray-500 hover:text-current"
                    >
                        Create new account
                    </a>
                    <a
                        onClick={() => navigate(routes.forgotPassword)}
                        className="text-md underline text-gray-500 hover:text-current"
                    >
                        Forgot password?
                    </a>
                </div>
            </div>
        </div>
    );
};
