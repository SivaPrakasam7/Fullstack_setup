import SvgIcon from './svg';

export const Logo = ({ className = 'w-16 h-16' }) => {
    return <SvgIcon path="/icons/svg/logo.svg" className={className} />;
};
