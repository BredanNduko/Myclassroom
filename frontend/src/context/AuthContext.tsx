import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role?: 'student' | 'lecturer') => Promise<void>;
  register: (email: string, password: string, name: string, role: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

   useEffect(() => {
     const token = localStorage.getItem('token');
     if (token) {
       api.Auth.getUser().then((userData: User) => {
         setUser(userData);
         setLoading(false);
       }).catch(() => {
         localStorage.removeItem('token');
         setLoading(false);
       });
     } else {
       setLoading(false);
     }
   }, []);

   const login = async (email: string, password: string, role?: 'student' | 'lecturer') => {
     const data = await api.Auth.login(email, password, role);
     localStorage.setItem('token', data.token);
     setUser(data.user);
   };

  const register = async (email: string, password: string, name: string, role: string) => {
    const data = await api.Auth.register(email, password, name, role);
    localStorage.setItem('token', data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
