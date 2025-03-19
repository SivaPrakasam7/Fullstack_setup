import { useContext, useMemo } from 'react';

//
import { fullNameRegex } from 'services/constants/regex';
import { updateUser } from 'services/repository/authentication';
import { IFormField } from 'src/app/components/form/form.types';
import { FormBuilder } from 'src/app/components/form/main';
import SvgIcon from 'src/app/components/svg';
import { UserContext } from 'src/providers/context';

//
export const UserInfo = () => {
    const user = useContext(UserContext);

    const form = useMemo(
        () =>
            ({
                name: {
                    label: 'Name',
                    placeHolder: 'Enter your name',
                    type: 'text',
                    required: true,
                    value: user?.name || '',
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
                    value: user?.email || '',
                    requiredLabel: 'Please enter your email',
                    disabled: true,
                },
            }) as Record<string, IFormField>,
        [JSON.stringify(user)]
    );

    const call = async (_payload: ILargeRecord) => {
        const res = await updateUser({
            name: _payload.name,
            profileURL: _payload.profileURL,
        });
        if (!res.error) user?.updateUser?.();
        return !res.error;
    };

    return (
        <>
            <p
                className="text-lg font-bold flex items-center gap-2 border-b pb-4"
                data-testid="USERINFO_PAGE"
            >
                <SvgIcon path="/icons/svg/user.svg" className="w-5 h-5" />{' '}
                Profile
            </p>
            <p className="text-md text-gray-400">
                Update your personal information and profile settings.
            </p>
            <FormBuilder
                form={form}
                call={call}
                buttonText="Update"
                layoutClass={`gap-1 sm:gap-2 max-w-screen-sm mt-6`}
                buttonClass={`app-button app-shadow !text-[16px] !px-6`}
            />
        </>
    );
};
