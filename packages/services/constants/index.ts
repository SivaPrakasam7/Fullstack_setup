export const baseURL = `${import.meta.env.VITE_ENCRYPTION}://${import.meta.env.VITE_IP}:${import.meta.env.VITE_API_PORT}`;

export const getTagValues = (v: string) => {
    return [
        ...new Set(
            `${v || ''}`
                .split(/( |;|,)/g)
                .filter((t) => !!t.replaceAll(/(\s|;|,)/g, '').trim())
        ),
    ];
};
