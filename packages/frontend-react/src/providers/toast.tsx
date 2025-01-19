import { ReactNode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

//
import Toast from 'src/app/components/toast';

//
export const ToastProvider = ({ children }: { children: ReactNode }) => {
    useEffect(() => {
        window.showToast = showToast;
    }, []);

    return (
        <div>
            <div
                id="handle-toast"
                className="fixed top-2 right-2 z-50 flex flex-col gap-2"
            />
            {children}
        </div>
    );
};

export const showToast = (props: IToast) => {
    const handelClose = () =>
        createRoot(document.getElementById('handle-toast')!).render(<></>);
    createRoot(document.getElementById('handle-toast')!).render(
        <Toast {...props} close={handelClose} />
    );
    setTimeout(() => {
        handelClose();
    }, 5000);
};

export interface IToast {
    message: string;
    type: 'info' | 'error' | 'warning' | 'success';
}
