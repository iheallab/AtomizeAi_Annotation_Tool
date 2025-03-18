
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';

type User = {
  username: string;
  token: string;
};

type AuthContextType = {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        // In a real app, you would verify the token with your backend here
        validateToken(parsedUser.token).catch(() => {
          // If token validation fails, log the user out
          logout();
        });
      } catch (e) {
        console.error('Failed to parse stored user', e);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const validateToken = async (token: string): Promise<boolean> => {
    // In a real app, this would make an API call to validate the token
    // For now, let's simulate token validation
    try {
      // Simulating API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if token is expired (for demo purposes)
      // In a real app, the backend would verify the token
      const isValid = !!token && token.length > 10;
      
      if (!isValid) {
        throw new Error('Invalid token');
      }
      
      return true;
    } catch (error) {
      console.error('Token validation failed', error);
      return false;
    }
  };

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // This would be an actual API call in a real application
      // For demo purposes, we'll simulate a successful login with any credentials
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock response for demo
      const response = {
        user: username,
        token: `mock-jwt-token-${Math.random().toString(36).substring(2)}`,
      };
      
      // Store user data in localStorage
      const userData = {
        username: response.user,
        token: response.token,
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      toast.success(`Welcome back, ${username}!`);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login failed', err);
      setError(err.message || 'Failed to login. Please try again.');
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    toast.info('You have been logged out');
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
