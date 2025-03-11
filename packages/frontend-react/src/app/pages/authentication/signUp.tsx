import { useNavigate } from 'react-router-dom';
import {
    emailRegex,
    fullNameRegex,
    passwordRegex,
} from 'services/constants/regex';
import { routes } from 'services/constants/routes';
import {
    register,
    requestVerification,
} from 'services/repository/authentication';
import { IFormField } from 'src/app/components/form/form.types';
import { FormBuilder } from 'src/app/components/form/main';

//
const form = {
    name: {
        label: 'Name',
        placeHolder: 'Enter your name',
        type: 'text',
        required: true,
        value: '',
        requiredLabel: 'Please enter your name',
        validations: [
            {
                type: 'regex',
                validate: fullNameRegex,
                message: 'Invalid name',
            },
        ],
    },
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
        validations: [
            {
                type: 'regex',
                validate: passwordRegex,
                message:
                    'Password must contain at least one uppercase letter, one lower case, one number, one symbol(@$!%*?&#), and be at least 8 characters long',
            },
        ],
    },
    confirmPassword: {
        label: 'Confirm Password',
        placeHolder: 'Re-enter your password',
        type: 'password',
        required: true,
        value: '',
        requiredLabel: 'Please enter confirmation password',
    },
} as Record<string, IFormField>;

export default () => {
    const navigate = useNavigate();

    const call = async (payload: ILargeRecord) => {
        const res = await register(payload);
        if (!res.error) await requestVerification({ email: payload.email });
        return !res.error;
    };

    return (
        <div className="flex flex-col gap-5 items-center justify-center app-height w-screen">
            <div className="max-w-[400px] w-full flex flex-col gap-2 p-2">
                <p className="text-4xl font-bold">Sign Up</p>
                <FormBuilder
                    form={form}
                    call={call}
                    buttonText="Sign Up"
                    layoutClass="gap-1"
                />
                <div className="w-full border-t border-gray-600"></div>
                <div
                    onClick={() => navigate(routes.signIn)}
                    className="text-md underline text-gray-500 hover:text-current cursor-pointer"
                >
                    Already have an account?
                </div>
            </div>
        </div>
    );
};
