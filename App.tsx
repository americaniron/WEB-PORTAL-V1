import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Quotes from './pages/Quotes';
import Marketing from './pages/Marketing';
import Inventory from './pages/Inventory';
import Layout from './components/Layout';
import { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);

  // Load user from local storage on mount (simulate persistence)
  useEffect(() => {
    const storedUser = localStorage.getItem('portal_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (user: User) => {
    setUser(user);
    localStorage.setItem('portal_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('portal_user');
  };

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" replace />} />
        
        <Route path="/" element={user ? <Layout user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}>
          <Route index element={<Dashboard />} />
          <Route path="leads" element={<Leads />} />
          <Route path="quotes" element={<Quotes />} />
          <Route path="marketing" element={<Marketing />} />
          <Route path="inventory" element={<Inventory />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;