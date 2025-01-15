export interface IStoreProps {
    user: ILargeRecord;
    token: string | null;
}

export interface IAppStoreProps {
    toasts: IToast[];
}

export interface IToast {
    type: 'success' | 'error' | 'warning' | 'info' | 'close' | 'clear';
    message: string;
    duration: number;
    timestamp: number;
}
