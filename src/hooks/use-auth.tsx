"use client"

import { AuthService } from '@/services/auth.service';
import { Claim } from '@/types/claims';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    claims: Claim;
    loading: boolean;
    isFranchisor: boolean;
}

const claimsInit = {
    branch: {
        branchId: 0,   
        branchName: '',       // default numeric id, adjust as needed
        isInternal: false,    // default boolean value
    },
    username: '',
    exp: 0,                 // default expiration timestamp (e.g., Unix epoch start)
    iat: 0,                 // default issued-at timestamp
    roles: [],              // empty array, no roles assigned yet
    sub: "",                // empty string for subject
    userId: 0,  
}

type AuthProviderProps = React.PropsWithChildren<object>;

const AuthContext = createContext<AuthContextType>({ claims: claimsInit, loading: true, isFranchisor: false });

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [claims, setClaims] = useState(claimsInit);
    const [loading, setLoading] = useState(true);

    const isFranchisor = claims?.roles?.[0] === "FRANCHISOR";

    useEffect(() => {
        const fetchClaims = async () => {
            try {
                const response = await AuthService.getCookie();
                if (!response || !response.userId) {
                    setClaims(claimsInit);
                } else {
                    setClaims(response);
                }
            } catch (error) {
                setClaims(claimsInit);
            } finally {
                setLoading(false);
            }
        };
        fetchClaims();
    }, []);

    return <AuthContext.Provider value={{ claims, loading, isFranchisor }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);