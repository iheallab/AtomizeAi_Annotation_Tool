import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import {
  checkUserLinksWithGoogleUrl,
  linkUserWithGoogleUrl,
  userAuthUrl,
} from '@/apis/api_url';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  ifUserLinksWithGoogle: (
    email: string
  ) => Promise<{ exists: boolean; user: User }>;
  linkUserWithGoogle: (email: string, username: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check for stored token on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user data', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    console.log('Trying to login with details : ', username, password);
    try {
      const response = await fetch(userAuthUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const userData: User = {
          username,
          token: data.token,
          userId: data.userId,
        };

        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        toast({
          title: 'Login Successful',
          description: `Welcome, ${userData.username}!`,
        });
        navigate('/');
      } else {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: 'Invalid username or password',
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: 'destructive',
        title: 'Login Error',
        description: 'An error occurred during login. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const ifUserLinksWithGoogle = async (email: string) => {
    const response = await fetch(
      checkUserLinksWithGoogleUrl + '?email=' + email,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );
    const data = await response.json();
    if (data.exists) {
      return {
        exists: true,
        user: data.user,
      };
    } else {
      return {
        exists: false,
        user: null,
      };
    }
  };

  const linkUserWithGoogle = async (email: string, username: string) => {
    const response = await fetch(
      linkUserWithGoogleUrl + '?email=' + email + '&username=' + username,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }
    );
    if (response.ok) {
      toast({
        title: 'User Linked with Google',
        description: 'User linked with Google successfully',
      });
      // wait for 1 seconds
      await new Promise((resolve) => setTimeout(resolve, 1000));
      login(username, username);
    } else {
      toast({
        variant: 'destructive',
        title: 'User Link with Google Failed',
        description:
          response.status === 404
            ? 'User not found'
            : response.status === 409
            ? 'User already linked with Google'
            : 'User link with Google failed',
      });
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        ifUserLinksWithGoogle,
        linkUserWithGoogle,
        isLoading,
      }}
    >
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
