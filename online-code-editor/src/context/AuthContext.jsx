import { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE } from '../config';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    token: localStorage.getItem('token'),
    isLoading: true,
    user: null
  });

  // on mount: verify or clear token
  useEffect(() => {
    const token = localStorage.getItem('token');   // ← read here instead of authState.token
    if (!token) {
      setAuthState({ token: null, isLoading: false, user: null });
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error();
        const user = await res.json();
        setAuthState({ token, isLoading: false, user });
      } catch {
        localStorage.removeItem('token');
        setAuthState({ token: null, isLoading: false, user: null });
      }
    })();
  }, []); // now legitimately only depends on mount

  const login = async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    localStorage.setItem('token', data.token);
    setAuthState({ token: data.token, isLoading: false, user: data.user });
  };

  const signup = async (firstName, lastName, email, password) => {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    localStorage.setItem('token', data.token);
    setAuthState({ token: data.token, isLoading: false, user: data.user });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({ token: null, isLoading: false, user: null });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
