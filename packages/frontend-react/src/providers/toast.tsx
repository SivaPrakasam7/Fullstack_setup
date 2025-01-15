import { ReactNode } from 'react';
import * as ReactDOM from 'react-dom';

//
import Toast from 'src/app/components/toast';

//
export const ToastProvider = ({ children }: { children: ReactNode }) => (
    <div>
        <div id="handle-toast" />
        {children}
    </div>
);

export const ToastHandler = (props: IToast) => {
    const handelClose = () =>
        ReactDOM.render(<></>, document.getElementById('handle-toast'));

    return <Toast {...props} close={handelClose} />;
};

export const useToast = (props: IToast) =>
    ReactDOM.render(
        <ToastHandler {...props} />,
        document.getElementById('handle-toast')
    );

export interface IToast {
    message: string;
    type: 'info' | 'error' | 'warning' | 'success';
}
