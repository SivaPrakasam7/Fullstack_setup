import { ReactNode, useEffect, useState } from 'react';
import { getUserDetail } from 'src/repository/authentication';
import { UserContext } from './context';

//
export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<ILargeRecord | undefined>();
    const [update, setUpdate] = useState(false);

    useEffect(() => {
        getUserDetail().then((data) => {
            setUser({ ...data, signedIn: !!data.userId });
            setLoading(false);
        });
    }, [update]);

    const updateUser = () => {
        setUpdate((prev) => !prev);
    };

    return (
        <UserContext.Provider value={{ ...user, loading, updateUser }}>
            {children}
        </UserContext.Provider>
    );
};
