// ===============================
// MikroMile — Auth Context (Dummy Auth)
// ===============================
// Simulates authentication by letting users switch between pre-seeded accounts.

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { getAll, Collections } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';

interface AuthContextType {
    currentUser: User | null;
    allUsers: User[];
    login: (userId: string) => void;
    logout: () => void;
    isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType>({
    currentUser: null,
    allUsers: [],
    login: () => { },
    logout: () => { },
    isLoggedIn: false,
});

const CURRENT_USER_KEY = 'mikromile_current_user';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [allUsers, setAllUsers] = useState<User[]>([]);

    useEffect(() => {
        // Seed the database on first load
        seedDatabase();

        const users = getAll<User>(Collections.USERS);
        setAllUsers(users);

        // Restore session
        const savedUserId = localStorage.getItem(CURRENT_USER_KEY);
        if (savedUserId) {
            const user = users.find((u) => u.id === savedUserId);
            if (user) setCurrentUser(user);
        }
    }, []);

    const login = (userId: string) => {
        const user = allUsers.find((u) => u.id === userId);
        if (user) {
            setCurrentUser(user);
            localStorage.setItem(CURRENT_USER_KEY, userId);
        }
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem(CURRENT_USER_KEY);
    };

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                allUsers,
                login,
                logout,
                isLoggedIn: !!currentUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
}
