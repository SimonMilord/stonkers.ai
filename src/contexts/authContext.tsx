import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isGuest: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check authentication status on app load
  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const backendUrl =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

      console.log('🔍 Checking auth status with backend:', backendUrl);
      console.log('🍪 Current cookies:', document.cookie);

      const response = await fetch(`${backendUrl}/auth/me`, {
        method: "GET",
        credentials: "include", // Include HTTP-only cookies
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log('📡 Auth response status:', response.status);

      if (response.ok) {
        const userData = await response.json();
        console.log('✅ User authenticated:', userData);
        setUser(userData);
      } else {
        console.log('❌ User not authenticated');
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    // Redirect to backend logout
    const backendUrl =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
    window.location.href = `${backendUrl}/auth/logout`;
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
