const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const env = import.meta.env;

export const API_BASE = trimTrailingSlash(
    env.VITE_API_BASE || "http://localhost:8100"
);

export const DODO_API_BASE = API_BASE;
export const ACNH_FINDER_API_BASE = API_BASE;
export const BLOGS_API_BASE = API_BASE;
