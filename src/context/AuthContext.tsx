import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface DiscordUser {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
    global_name: string | null;
    premium_type?: number;
}

interface AuthContextType {
    user: DiscordUser | null;
    token: string | null;
    loading: boolean;
    login: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_TOKEN = "chopaeng_discord_token";
const STORAGE_KEY_USER = "chopaeng_discord_user";
const STORAGE_KEY_EXPIRY = "chopaeng_discord_expiry";

const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID as string | undefined;

const DEFAULT_TOKEN_EXPIRY_SECONDS = 604800; // 7 days

const getAvatarUrl = (user: DiscordUser): string => {
    if (user.avatar) {
        return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`;
    }
    // Use user ID to derive a consistent default avatar index (discriminators are deprecated)
    const index = Number(BigInt(user.id) >> BigInt(22)) % 5;
    return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
};

export { getAvatarUrl };

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<DiscordUser | null>(() => {
        try {
            const cached = localStorage.getItem(STORAGE_KEY_USER);
            const expiry = localStorage.getItem(STORAGE_KEY_EXPIRY);
            if (cached && expiry && Date.now() < parseInt(expiry, 10)) {
                return JSON.parse(cached);
            }
        } catch {
            // ignore parse errors
        }
        return null;
    });

    const [token, setToken] = useState<string | null>(() => {
        try {
            const expiry = localStorage.getItem(STORAGE_KEY_EXPIRY);
            if (expiry && Date.now() < parseInt(expiry, 10)) {
                return localStorage.getItem(STORAGE_KEY_TOKEN);
            }
        } catch {
            // ignore
        }
        return null;
    });

    const [loading, setLoading] = useState(false);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem(STORAGE_KEY_TOKEN);
        localStorage.removeItem(STORAGE_KEY_USER);
        localStorage.removeItem(STORAGE_KEY_EXPIRY);
    }, []);

    const fetchUser = useCallback(async (accessToken: string) => {
        setLoading(true);
        try {
            const res = await fetch("https://discord.com/api/users/@me", {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (!res.ok) {
                logout();
                return;
            }
            const data: DiscordUser = await res.json();
            setUser(data);
            setToken(accessToken);
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(data));
            localStorage.setItem(STORAGE_KEY_TOKEN, accessToken);
        } catch {
            logout();
        } finally {
            setLoading(false);
        }
    }, [logout]);

    // Parse OAuth2 implicit-flow callback from URL hash
    useEffect(() => {
        const hash = window.location.hash;
        if (!hash) return;

        const params = new URLSearchParams(hash.slice(1));
        const accessToken = params.get("access_token");
        const expiresIn = params.get("expires_in");

        if (accessToken) {
            const expiry = Date.now() + (parseInt(expiresIn ?? String(DEFAULT_TOKEN_EXPIRY_SECONDS), 10) * 1000);
            localStorage.setItem(STORAGE_KEY_EXPIRY, expiry.toString());
            // Clear the hash from the URL without causing a navigation
            window.history.replaceState(null, "", window.location.pathname + window.location.search);
            fetchUser(accessToken);
        }
    }, [fetchUser]);

    const login = useCallback(() => {
        if (!DISCORD_CLIENT_ID) {
            console.error("VITE_DISCORD_CLIENT_ID is not set.");
            return;
        }
        const redirectUri = encodeURIComponent(`${window.location.origin}/dashboard`);
        const scope = encodeURIComponent("identify");
        const url = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`;
        window.location.href = url;
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
