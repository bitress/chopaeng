import React, { useState, useEffect, useCallback } from "react";
import { DODO_API_BASE } from "../config/api";
import { AuthContext, type AuthUser } from "./authContextShared";
import { clearAuthToken, getAuthToken } from "./authToken";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchMe = useCallback(async (token: string): Promise<boolean> => {
        try {
            const resp = await fetch(`${DODO_API_BASE}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
                credentials: "include",
            });
            if (!resp.ok) return false;
            const data = await resp.json();
            if (data.logged_in) {
                setUser({
                    user_id:  data.user_id,
                    username: data.username,
                    avatar:   data.avatar,
                    roles:    data.roles ?? [],
                    is_mod:   data.is_mod ?? false,
                });
                return true;
            }
        } catch {
            // network error — treat as not logged in
        }
        return false;
    }, []);

    useEffect(() => {
        const token = getAuthToken();
        if (token) {
            fetchMe(token).then(ok => {
                if (!ok) clearAuthToken();
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, [fetchMe]);

    const login = () => {
        const returnTo = `${window.location.origin}/auth/callback`;
        window.location.href = `${DODO_API_BASE}/api/auth/discord?return_to=${encodeURIComponent(returnTo)}`;
    };

    const logout = async () => {
        const token = getAuthToken();
        if (token) {
            try {
                await fetch(`${DODO_API_BASE}/api/auth/logout`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    credentials: "include",
                });
            } catch { /* ignore */ }
        }
        clearAuthToken();
        setUser(null);
    };

    const hasRole = (roleIds: string[]): boolean => {
        if (!user) return false;
        if (user.is_mod) return true;
        return roleIds.some(id => user.roles.includes(id));
    };

    const canAccessIsland = (requiredRoles: string[]): boolean => {
        if (!requiredRoles || requiredRoles.length === 0) return true;
        if (!user) return false;
        return hasRole(requiredRoles);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, hasRole, canAccessIsland }}>
            {children}
        </AuthContext.Provider>
    );
};
