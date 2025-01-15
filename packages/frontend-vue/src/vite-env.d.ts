/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="vite/client" />

interface ImportMetaEnv extends Readonly<Record<string, string>> {
    readonly VITE_APP_NAME: string;
    readonly VITE_ENCRYPTION: string;
    readonly VITE_SOCKET_ENCRYPTION: string;
    readonly VITE_IP: string;
    readonly VITE_API_PORT: string;
    readonly VITE_SOCKET_PORT: string;
    readonly VITE_CDN_DOMAIN: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

//
declare module '*.vue';
declare module 'virtual:svg-icons';
declare module 'vuex' {
    export * from 'vuex/types/index.d.ts';
    export * from 'vuex/types/helpers.d.ts';
    export * from 'vuex/types/logger.d.ts';
    export * from 'vuex/types/vue.d.ts';
}

declare type ILargeRecord = any;
declare type ITimer = any;

//
interface Window {
    skipWaiting: () => void;
    clients: {
        claim: () => void;
        matchAll: (arg0: { type: string }) => Promise<any>;
        openWindow: (arg0: string) => any;
    };
}

interface Event {
    target: EventTarget;
    waitUntil: (args: any) => void;
    respondWith: (args: any) => void;
    request: any;
}
