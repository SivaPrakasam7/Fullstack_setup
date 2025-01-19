import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

//
import { routes } from 'services/constants/routes';
import { getUserDetail } from 'services/repository/authentication';
import { UserContext } from './context';

//
export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<ILargeRecord | undefined>();
    const [update, setUpdate] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        getUserDetail().then((data) => {
            setUser({ ...data, signedIn: !!data.userId });
            window.signedIn = !!data.userId;
            setLoading(false);
        });
    }, [update]);

    useEffect(() => {
        window.logout = () => {
            setUser({ signedIn: false });
            window.signedIn = false;
            navigate(routes.root);
        };
    }, []);

    const updateUser = () => {
        setUpdate((prev) => !prev);
    };

    return (
        <UserContext.Provider value={{ ...user, loading, updateUser }}>
            {children}
        </UserContext.Provider>
    );
};
