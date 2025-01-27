export const generateId = () => {
    return Array.from({ length: 32 }, () =>
        Math.random().toString(36).charAt(2)
    ).join('');
};

export const generateSecretKey = () => {
    return Math.random().toString(36).substring(2, 12);
};
