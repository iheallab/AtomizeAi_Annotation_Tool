import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

// Define AuthContext shape
interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  interface DecodedToken {
    exp: number;
    username: string;
  }

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const token = localStorage.getItem("jwt");
    if (!token) return false;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.exp > Math.floor(Date.now() / 1000);
    } catch (error) {
      return false;
    }
  });

  // Effect to check token expiration on every refresh
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      if (decoded.exp < Math.floor(Date.now() / 1000)) {
        console.log("Token expired, logging out...");
        logout();
      } else {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.log("Invalid token, logging out...");
      logout();
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem("jwt", token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("jwt");
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
