import { createContext } from 'react';

//
export const UserContext = createContext<
    (ILargeRecord & { updateUser: () => void; loading: boolean }) | undefined
>(undefined);
