import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext<any>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("jwt");

    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    try {
      interface DecodedToken {
        exp: number;
        user?: any;
      }
      const decoded = jwtDecode<DecodedToken>(token);
      console.log("Decoded Token:", decoded);

      if (decoded.exp * 1000 < Date.now()) {
        console.log("Token expired, logging out...");
        localStorage.removeItem("jwt");
        setIsAuthenticated(false);
        setUser(null);
      } else {
        setIsAuthenticated(true);
        setUser(decoded.user);
      }
    } catch (error) {
      console.log("Invalid token, redirecting to login...");
      localStorage.removeItem("jwt");
      setIsAuthenticated(false);
      setUser(null);
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
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
