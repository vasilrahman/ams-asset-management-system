
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Asset, User, Complaint, VerificationLog, Theme } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Simple Router State to replace React Router for this demo
interface RouteState {
  path: string;
  params?: any;
}

interface AppContextType {
  currentUser: User | null;
  assets: Asset[];
  users: User[];
  logs: VerificationLog[];
  complaints: Complaint[];
  currentRoute: RouteState;
  theme: Theme;

  navigate: (path: string, params?: any) => void;
  login: (user: User) => void;
  logout: () => void;
  toggleTheme: () => void;

  addAsset: (asset: Asset) => void;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;

  addUser: (user: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;

  addComplaint: (complaint: Complaint) => void;
  verifyAsset: (assetId: string, verifierName: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children?: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<VerificationLog[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [theme, setTheme] = useState<Theme>('light');
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  // Navigation State
  const [currentRoute, setCurrentRoute] = useState<RouteState>({ path: '/dashboard' });

  // Initialize Theme from LocalStorage
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme;
    if (storedTheme) {
      setTheme(storedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  // Apply Theme to DOM
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Fetch Data on Mount or Token Change
  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const fetchData = async () => {
    if (!token) return;

    try {
      const headers = { Authorization: `Bearer ${token}` };

      const assetsRes = await fetch(`${API_URL}/assets`, { headers });
      if (assetsRes.ok) setAssets(await assetsRes.json());

      const usersRes = await fetch(`${API_URL}/users`, { headers });
      if (usersRes.ok) setUsers(await usersRes.json());

      // Logs and Complaints would be fetched similarly if endpoints existed
      // For now, we'll keep them empty or mock them if needed

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const navigate = (path: string, params?: any) => {
    setCurrentRoute({ path, params });
  };

  const login = async (userCredentials: any) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userCredentials)
      });

      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        localStorage.setItem('token', data.token);
        setCurrentUser(data.user);
        navigate(data.user.role === 'ADMIN' ? '/dashboard' : '/staff/home');
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed');
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
    setCurrentUser(null);
    navigate('/');
  };

  const addAsset = async (asset: Asset) => {
    try {
      const res = await fetch(`${API_URL}/assets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(asset)
      });

      if (res.ok) {
        const newAsset = await res.json();
        setAssets((prev) => [newAsset, ...prev]);
      }
    } catch (error) {
      console.error('Error adding asset:', error);
    }
  };

  const updateAsset = async (id: string, updates: Partial<Asset>) => {
    try {
      const res = await fetch(`${API_URL}/assets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (res.ok) {
        const updatedAsset = await res.json();
        setAssets((prev) => prev.map((a) => (a.id === id ? updatedAsset : a)));
      }
    } catch (error) {
      console.error('Error updating asset:', error);
    }
  };

  const deleteAsset = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/assets/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setAssets((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (error) {
      console.error('Error deleting asset:', error);
    }
  };

  const addUser = async (user: User) => {
    try {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(user)
      });

      if (res.ok) {
        const newUser = await res.json();
        setUsers((prev) => [...prev, newUser]);
      }
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    try {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUsers((prev) => prev.map((u) => (u.id === id ? updatedUser : u)));
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const addComplaint = async (complaint: Complaint) => {
    try {
      const res = await fetch(`${API_URL}/assets/${complaint.assetId}/complaint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(complaint)
      });

      if (res.ok) {
        const newComplaint = await res.json();
        setComplaints((prev) => [newComplaint, ...prev]);
      }
    } catch (error) {
      console.error('Error adding complaint:', error);
    }
  };

  const verifyAsset = async (assetId: string, verifierName: string) => {
    try {
      const res = await fetch(`${API_URL}/assets/${assetId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ verifierName })
      });

      if (res.ok) {
        const { log } = await res.json();
        const timestamp = new Date().toISOString();

        // Optimistic update or refetch
        setAssets((prev) => prev.map((a) => (a.id === assetId ? { ...a, lastVerifiedDate: timestamp, verifiedBy: verifierName } : a)));
        setLogs(prev => [log, ...prev]);
      }
    } catch (error) {
      console.error('Error verifying asset:', error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        assets,
        users,
        logs,
        complaints,
        currentRoute,
        theme,
        navigate,
        login,
        logout,
        toggleTheme,
        addAsset,
        updateAsset,
        deleteAsset,
        addUser,
        updateUser,
        deleteUser,
        addComplaint,
        verifyAsset,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
