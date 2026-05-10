import { createContext, useContext, useState, ReactNode } from "react";

interface Permission { name: string; }
interface Role { name: string; permissions: Permission[]; }
interface User { id: string; email: string; role: Role; }

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Read from localStorage so they stay logged in on refresh
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("tb_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("tb_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("tb_user");
  };

  const isAdmin = user?.role.name === "ADMIN";

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}