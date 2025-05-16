import { useState } from 'react';
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
import { DialogView } from 'src/app/components/dialog';
import { IFormField } from 'src/app/components/form/form.types';
import { FormBuilder } from 'src/app/components/form/main';
import SvgIcon from 'src/app/components/svg';

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
    const [email, setEmail] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const handleOpen = () => setOpen((prev) => !prev);

    const call = async (payload: ILargeRecord) => {
        const res = await register(payload);
        if (!res.error) {
            setEmail(payload.email);
            await requestVerification({ email: payload.email });
            handleOpen();
        }
        return !res.error;
    };

    const resendEmail = async () => {
        if (email) {
            setLoading(true);
            await requestVerification({
                email,
            });
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-5 items-center justify-center app-height app-width">
            <div className="max-w-[400px] w-full flex flex-col gap-2 p-2 app-container app-shadow">
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
            <DialogView open={open} close={handleOpen}>
                <div className="flex flex-col items-center gap-5 rounded-lg p-7 py-10 max-w-md">
                    <p className="text-xl font-bold flex items-center gap-2">
                        <SvgIcon
                            path="/icons/avg/app/check-rounded.svg"
                            className="w-6 h-6"
                        />
                        Check Your Email
                    </p>
                    <p className="text-lg text-center">
                        Email verify request has been sent to your email. Please
                        check your email to verify your email. If you didn't
                        receive
                    </p>
                    <button
                        className="app-button-fill !text-base"
                        disabled={loading}
                        onClick={resendEmail}
                    >
                        Click here to resend
                    </button>
                </div>
            </DialogView>
        </div>
    );
};
