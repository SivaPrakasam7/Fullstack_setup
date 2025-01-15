import { useEffect, useState } from 'react';
import { getSvgIcon } from 'virtual:svg-icons';

//
const SvgIcon = ({ path, className }: { path: string; className: string }) => {
    const [icon, setIcon] = useState('');

    useEffect(() => {
        setIcon(getSvgIcon(path.split('/').slice(-2).join('/')));
    }, [path]);

    return (
        <svg
            className={className}
            dangerouslySetInnerHTML={{ __html: icon }}
        ></svg>
    );
};

export default SvgIcon;
