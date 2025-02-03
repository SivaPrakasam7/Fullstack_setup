import { useNavigate } from 'react-router-dom';
import { emailRegex } from 'services/constants/regex';
import { routes } from 'services/constants/routes';
import { requestResetPassword } from 'services/repository/authentication';
import { IFormField } from 'src/app/components/form/form.types';
import { FormBuilder } from 'src/app/components/form/main';

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
} as Record<string, IFormField>;

export default () => {
    const navigate = useNavigate();

    const call = async (payload: ILargeRecord) => {
        const res = await requestResetPassword(payload);
        return !res.error;
    };

    return (
        <div className="flex flex-col gap-5 items-center justify-center h-screen w-screen">
            <div className="max-w-[400px] w-full flex flex-col gap-2 p-2">
                <p className="text-4xl font-bold">Forgot Password</p>
                <FormBuilder
                    form={form}
                    call={call}
                    buttonText="Request reset password link"
                    layoutClass="gap-1"
                />
                <div className="w-full border-t border-gray-600"></div>
                <div
                    onClick={() => navigate(routes.signIn)}
                    className="text-md underline text-gray-500 hover:text-current"
                >
                    Back to login
                </div>
            </div>
        </div>
    );
};
