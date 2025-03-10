import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

//
import { routes } from 'services/constants/routes';
import { UserContext } from 'src/providers/context';
import { Avatar } from 'src/app/components/avatar';
import { logout } from 'services/repository/authentication';

//
export const Profile = () => {
    const user = useContext(UserContext);
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const menuRef = useRef<HTMLDivElement>(null);

    const handleOpen = () => setOpen((prev) => !prev);

    const _logout = async () => {
        await logout();
        user?.updateUser?.();
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                open &&
                menuRef.current &&
                event.target &&
                !menuRef.current?.contains(event.target as Node)
            )
                setOpen(false);
        };

        if (open) document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open]);

    return (
        <div className="relative cursor-pointer">
            <Avatar name={user!.name!} onClick={handleOpen} />
            {open && (
                <div ref={menuRef} className="app-menu mt-2 w-44" role="menu">
                    <div
                        className="app-menu-item"
                        role="menuitem"
                        data-testid="profile"
                        onClick={() => {
                            handleOpen();
                            navigate(routes.settings, {
                                state: {
                                    menu: 'profile',
                                },
                            });
                        }}
                    >
                        Profile
                    </div>
                    <div
                        className="app-menu-item"
                        role="menuitem"
                        data-testid="change-password"
                        onClick={() => {
                            handleOpen();
                            navigate(routes.settings, {
                                state: {
                                    menu: 'password',
                                },
                            });
                        }}
                    >
                        Change password
                    </div>
                    <div
                        className="app-menu-item"
                        role="menuitem"
                        data-testid="settings"
                        onClick={() => {
                            handleOpen();
                            navigate(routes.settings, {
                                state: {
                                    menu: 'setting',
                                },
                            });
                        }}
                    >
                        Settings
                    </div>
                    <div
                        className="app-menu-item !text-red-500"
                        role="menuitem"
                        data-testid="logout"
                        onClick={() => {
                            handleOpen();
                            _logout();
                        }}
                    >
                        Logout
                    </div>
                </div>
            )}
        </div>
    );
};
