//
import { passwordRegex } from 'services/constants/regex';
import { updatePassword } from 'services/repository/authentication';
import { IFormField } from 'src/app/components/form/form.types';
import { FormBuilder } from 'src/app/components/form/main';
import SvgIcon from 'src/app/components/svg';

//
const form = {
    currentPassword: {
        label: 'Current Password',
        placeHolder: 'Enter your current password',
        type: 'password',
        required: true,
        value: '',
        requiredLabel: 'Please enter your current password',
    },
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

export const ChangePassword = () => {
    const call = async (payload: ILargeRecord) => {
        const res = await updatePassword(payload);
        return !res.error;
    };

    return (
        <>
            <p
                className="text-lg font-bold flex items-center gap-2 border-b pb-4"
                data-testid="CHANGE_PASSWORD_PAGE"
            >
                <SvgIcon path="/icons/svg/lock.svg" className="w-5 h-5" />{' '}
                Change Password
            </p>
            <p className="text-md text-gray-400">Update your password</p>
            <FormBuilder
                form={form}
                call={call}
                buttonText="Update"
                layoutClass={`gap-1 sm:gap-2 max-w-screen-sm mt-6`}
                buttonClass={`app-button-fill !text-[16px] !px-6`}
            />
        </>
    );
};
