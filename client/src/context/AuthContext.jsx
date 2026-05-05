import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../api/api.js';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('team-task-token'));
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem('team-task-token');
      if (!savedToken) {
        setIsLoading(false);
        return;
      }

      try {
        setToken(savedToken);
        const response = await authService.getMe();
        setUser(response.data.user);
      } catch (error) {
        localStorage.removeItem('team-task-token');
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    const { token: authToken, user: authUser } = response.data;

    localStorage.setItem('team-task-token', authToken);
    setToken(authToken);
    setUser(authUser);
    navigate('/dashboard');
  };

  const signup = async (data) => {
    const response = await authService.signup(data);
    const { token: authToken, user: authUser } = response.data;

    localStorage.setItem('team-task-token', authToken);
    setToken(authToken);
    setUser(authUser);
    navigate('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('team-task-token');
    setUser(null);
    setToken(null);
    navigate('/login');
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isAuthenticated, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};
