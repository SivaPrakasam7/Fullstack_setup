//
import SvgIcon from 'src/app/components/svg';

//
export const Setting = () => {
    return (
        <>
            <p
                className="text-lg font-bold flex items-center gap-2 border-b pb-4"
                data-testid="APP_SETTING_PAGE"
            >
                <SvgIcon path="/icons/svg/setting.svg" className="w-5 h-5" />{' '}
                Settings
            </p>
            <p className="text-lg font-bold text-center py-10">App Settings</p>
        </>
    );
};
