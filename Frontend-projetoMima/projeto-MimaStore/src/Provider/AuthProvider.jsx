import React, { createContext, useState, useEffect } from 'react';
import API from './API';

export const AuthContext = createContext({
  token: null,
  user: null,
  login: (token) => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try { return localStorage.getItem('token'); } catch(e) { return null; }
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // tentar decodificar usuário do token (se for JWT)
      try {
        const parts = token.split('.');
        if (parts.length >= 2) {
          const payload = parts[1];
          const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const obj = JSON.parse(jsonPayload);
          setUser({ email: obj.sub || obj.email || obj.user_name || null });
        }
      } catch (e) {
        setUser(null);
      }
    } else {
      delete API.defaults.headers.common['Authorization'];
      setUser(null);
    }
  }, [token]);

  const login = (newToken) => {
    try { localStorage.setItem('token', newToken); } catch(e){}
    setToken(newToken);
  };

  const logout = () => {
    try { localStorage.removeItem('token'); } catch(e){}
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
