import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { AuthContextType, User } from "../types";
import axios from "axios";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // TODO: Implement token validation and user info fetching
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post("http://localhost:3000/auth/login", {
        username,
        password,
      });
      const { access_token } = response.data;
      localStorage.setItem("token", access_token);
      // TODO: Fetch user info and set user state
    } catch (error) {
      throw new Error("Log in failed");
    }
  };

  const register = async (username: string, password: string) => {
    try {
      await axios.post("http://localhost:3000/auth/register", {
        username,
        password,
      });
      await login(username, password);
    } catch (error) {
      throw new Error("Sign up failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
