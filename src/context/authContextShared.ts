import { createContext } from "react";

export interface AuthUser {
    user_id: string;
    username: string;
    avatar: string;
    roles: string[];
    is_mod: boolean;
}

export interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    login: () => void;
    logout: () => Promise<void>;
    hasRole: (roleIds: string[]) => boolean;
    canAccessIsland: (requiredRoles: string[]) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);