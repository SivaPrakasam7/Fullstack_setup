import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

//
import SvgIcon from 'src/app/components/svg';
import { UserInfo } from './components/userInfo';
import { ChangePassword } from './components/changePassword';
import { Setting } from './components/setting';

//
const navigation = [
    { label: 'Profile', key: 'profile_tab', icon: '/icons/svg/user.svg' },
    {
        label: 'Change password',
        key: 'change_password_tab',
        icon: '/icons/svg/lock.svg',
    },
    { label: 'Settings', key: 'setting_tab', icon: '/icons/svg/setting.svg' },
];

export default () => {
    const [tab, setTab] = useState('profile_tab');
    const { state } = useLocation();

    useEffect(() => {
        if (state?.menu) setTab(state.menu);
    }, [state?.menu]);

    return (
        <>
            <div
                className="max-w-screen-lg w-full self-center m-auto app-height"
                data-testid="PROFILE_PAGE"
            >
                <p className="text-2xl font-bold">Settings</p>
                <p className="text-gray-500 my-2  mb-5">
                    Manage your account settings and preferences.
                </p>
                <div className="flex max-sm:flex-col gap-2 w-full mx-auto">
                    <div className="flex sm:flex-col gap-3 sticky top-24 w-fit max-sm:self-center sm:min-w-[270px] sm:h-[80dvh] overflow-hidden light:bg-white border app-container app-inner-shadow !p-0 sm:!pt-5">
                        {navigation.map((_tab) => (
                            <div
                                key={_tab.label}
                                data-testid={_tab.key}
                                className={`cursor-pointer text-lg capitalize max-sm:!p-3 max-sm:!px-6 flex items-center gap-2 app-button !justify-start !rounded-none !w-full`}
                                onClick={() => {
                                    setTab(_tab.key);
                                }}
                            >
                                <SvgIcon path={_tab.icon} className="w-4 h-4" />
                                {_tab.key === tab && (
                                    <span className="h-1 sm:w-1 max-sm:rounded-t-lg sm:rounded-r-lg bg-current w-6 sm:h-8 absolute max-sm:-mb-9 -ml-1 sm:-ml-4"></span>
                                )}
                                <p className="max-sm:hidden text-[16px]">
                                    {_tab.label}
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col gap-4 px-2 py-8 sm:p-8 w-full light:bg-white rounded-lg border app-container app-shadow">
                        {
                            {
                                profile_tab: <UserInfo />,
                                change_password_tab: <ChangePassword />,
                                setting_tab: <Setting />,
                            }[tab.toLowerCase()]
                        }
                    </div>
                </div>
            </div>
        </>
    );
};
