import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserType } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import {
  changePasswordUrl,
  checkUserLinksWithGoogleUrl,
  linkUserWithGoogleUrl,
  loginWithGoogleUrl,
  userAuthUrl,
} from '@/apis/api_url';
import { useSetAtom } from 'jotai';
import { isFirstTimeLoginAtom } from '@/atoms/atoms';

interface AuthContextType {
  user: UserType | null;
  login: (username: string, password: string) => Promise<void>;
  loginWithGoogle: (email: string) => Promise<void>;
  ifUserLinksWithGoogle: (
    email: string
  ) => Promise<{ exists: boolean; user: UserType }>;
  linkUserWithGoogle: (email: string, username: string) => Promise<void>;
  changePassword: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const setIsFirstTimeLogin = useSetAtom(isFirstTimeLoginAtom);

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
        const userData: UserType = {
          username: data.user.username,
          token: data.token,
          userId: data.userId,
          email: data.user.email,
        };

        if (username === password) {
          setIsFirstTimeLogin(true);
          return;
        }

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

  const loginWithGoogle = async (email: string) => {
    const response = await fetch(loginWithGoogleUrl + '?email=' + email, {
      method: 'POST',
    });

    if (response.ok) {
      const data = await response.json();
      const userData: UserType = {
        username: data.user.username,
        token: data.token,
        userId: data.userId,
        email: data.user.email,
      };

      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      navigate('/');
    } else {
      toast({
        variant: 'destructive',
        title: 'Login with Google Failed',
        description: 'Failed to login with Google. Please try again.',
      });
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

      const data = await response.json();
      const userData: UserType = {
        username: data.user.username,
        token: data.token,
        userId: data.userId,
        email: data.user.email,
      };

      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      navigate('/');
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

  const changePassword = async (username: string, password: string) => {
    const response = await fetch(changePasswordUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      const userData: UserType = {
        username: data.user.username,
        token: data.token,
        userId: data.userId,
        email: data.user.email,
      };

      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsFirstTimeLogin(false);
      toast({
        title: 'Password Changed Successfully',
        description:
          'Your password has been updated and you are now logged in.',
      });
      navigate('/');
    } else {
      toast({
        variant: 'destructive',
        title: 'Password Change Failed',
        description: 'Failed to change password. Please try again.',
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
        loginWithGoogle,
        logout,
        ifUserLinksWithGoogle,
        linkUserWithGoogle,
        changePassword,
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
