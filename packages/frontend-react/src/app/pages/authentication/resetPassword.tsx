import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

//
import { passwordRegex } from 'services/constants/regex';
import { routes } from 'services/constants/routes';
import { changePassword } from 'services/repository/authentication';
import { IFormField } from 'src/app/components/form/form.types';
import { FormBuilder } from 'src/app/components/form/main';

//
const form = {
    password: {
        label: 'New Password',
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
        label: 'Re-Enter New Password',
        placeHolder: 'Re-enter your password',
        type: 'password',
        required: true,
        value: '',
        requiredLabel: 'Please enter confirmation password',
        validations: [
            {
                type: 'function',
                validate: (values, name) => {
                    return values.password === values[name]
                        ? ''
                        : 'Password does not match';
                },
            },
        ],
    },
} as Record<string, IFormField>;

export default () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    //
    const call = async (payload: ILargeRecord) => {
        const res = await changePassword(
            payload,
            searchParams.get('token') as string
        );
        if (!res.error) navigate(routes.signIn);
        return !res.error;
    };

    //
    useEffect(() => {
        const token = searchParams.get('token') as string;
        if (!token) navigate(routes.root);
    }, [searchParams.get('token')]);

    //
    return (
        <div className="flex flex-col gap-5 items-center justify-center h-screen w-screen">
            <div className="max-w-[400px] w-full flex flex-col gap-2 p-2">
                <p className="text-4xl font-bold">Reset Password</p>
                <FormBuilder
                    form={form}
                    call={call}
                    buttonText="Change Password"
                    layoutClass="gap-1"
                />
            </div>
        </div>
    );
};
