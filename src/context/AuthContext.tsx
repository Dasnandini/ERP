"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authApi } from "@/services/api";

export interface User {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  emailVerified: boolean;
  status: string;
  profileImageId?: string | null;
}

export interface CompanyMembership {
  membershipId: string;
  isDefaultCompany: boolean;
  joinedAt: string;
  companyId: string;
  companyName: string;
  companySlug: string;
  companyPhone: string;
  companyEmail: string | null;
  currency: string;
  timezone: string;
  roleId: string | null;
  roleName: string | null;
}

interface AuthContextType {
  user: User | null;
  hasCompany: boolean;
  activeCompany: CompanyMembership | null;
  memberships: CompanyMembership[];
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  hasCompany: false,
  activeCompany: null,
  memberships: [],
  loading: true,
  refreshUser: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hasCompany, setHasCompany] = useState<boolean>(false);
  const [activeCompany, setActiveCompany] = useState<CompanyMembership | null>(null);
  const [memberships, setMemberships] = useState<CompanyMembership[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    setLoading(true);
    const res = await authApi.getMe();
    if (res.data && res.data.user) {
      setUser(res.data.user);
      setHasCompany(!!res.data.hasCompany);
      setActiveCompany(res.data.activeCompany || null);
      setMemberships(res.data.memberships || []);
    } else {
      setUser(null);
      setHasCompany(false);
      setActiveCompany(null);
      setMemberships([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    setHasCompany(false);
    setActiveCompany(null);
    setMemberships([]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        hasCompany,
        activeCompany,
        memberships,
        loading,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
