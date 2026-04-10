const STORAGE_KEY = "chopaeng_auth_token";

export const storeAuthToken = (token: string) => {
    localStorage.setItem(STORAGE_KEY, token);
};

export const getAuthToken = (): string | null => {
    return localStorage.getItem(STORAGE_KEY);
};

export const clearAuthToken = () => {
    localStorage.removeItem(STORAGE_KEY);
};