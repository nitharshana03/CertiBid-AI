// CertiBid AI - Auth Context & Role State Manager
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const roleProfiles = {
  ADMIN: {
    id: "usr-admin-001",
    name: "System Administrator",
    email: "admin@certibid.com",
    role: "ADMIN",
    roleTitle: "Chief Technology Officer",
    department: "IT Operations",
    organization: "CertiBid AI Gov",
    avatar: "SA"
  },
  OFFICER: {
    id: "usr-officer-001",
    name: "Sarah Connor",
    email: "officer@certibid.com",
    role: "OFFICER",
    roleTitle: "Senior Procurement Officer",
    department: "Infrastructure & Public Works",
    organization: "Department of Transportation",
    avatar: "SC"
  },
  BIDDER: {
    id: "usr-vendor-001",
    name: "Acme Construction Services",
    email: "vendor@certibid.com",
    role: "BIDDER",
    roleTitle: "Managing Director",
    organization: "Acme Infrastructure Inc.",
    department: "Commercial Bidding",
    bidderId: "VND-10029",
    avatar: "AC"
  }
};

export const resolveRoleProfile = (roleKey) => {
  if (!roleKey) return roleProfiles.ADMIN;
  const upper = String(roleKey).toUpperCase().trim();
  if (upper === 'ADMIN' || upper === 'ADMINISTRATOR') return roleProfiles.ADMIN;
  if (upper === 'OFFICER' || upper === 'PROCUREMENT OFFICER') return roleProfiles.OFFICER;
  if (upper === 'BIDDER' || upper === 'VENDOR') return roleProfiles.BIDDER;
  return roleProfiles.BIDDER;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const isAuth = localStorage.getItem('certibid_authenticated') === 'true';
    if (!isAuth) return null;
    const savedUser = localStorage.getItem('certibid_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {}
    }
    const savedRole = localStorage.getItem('certibid_user_role') || 'ADMIN';
    return resolveRoleProfile(savedRole);
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('certibid_authenticated') === 'true' && !!user;
  });

  const login = (userData, roleHint) => {
    let profile = null;
    let role = 'BIDDER';

    if (typeof userData === 'object' && userData !== null) {
      role = String(userData.role || roleHint || 'BIDDER').toUpperCase().trim();
      if (role === 'VENDOR') role = 'BIDDER';
      profile = { ...userData, role };
    } else {
      role = String(userData || roleHint || 'BIDDER').toUpperCase().trim();
      if (role === 'VENDOR') role = 'BIDDER';
      profile = resolveRoleProfile(role);
    }

    setUser(profile);
    setIsAuthenticated(true);
    localStorage.setItem('certibid_authenticated', 'true');
    localStorage.setItem('certibid_user_role', role);
    localStorage.setItem('certibid_user', JSON.stringify(profile));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.setItem('certibid_authenticated', 'false');
    localStorage.removeItem('certibid_user_role');
    localStorage.removeItem('certibid_user');
    localStorage.removeItem('certibid_token');
    localStorage.removeItem('token');
  };

  const updateUser = (updatedFields) => {
    setUser(prev => {
      const merged = { ...prev, ...updatedFields };
      localStorage.setItem('certibid_user', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, updateUser, roleProfiles, resolveRoleProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
