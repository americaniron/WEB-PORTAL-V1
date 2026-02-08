import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Quotes from './pages/Quotes';
import QuoteDetail from './pages/QuoteDetail';
import Marketing from './pages/Marketing';
import Inventory from './pages/Inventory';
import Projects from './pages/Projects';
import TimeTracking from './pages/TimeTracking';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import DataIntake from './pages/DataIntake';
import Layout from './components/Layout';
import { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);

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
          <Route path="quotes/:id" element={<QuoteDetail />} />
          <Route path="marketing" element={<Marketing />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="projects" element={<Projects />} />
          <Route path="time-tracking" element={<TimeTracking />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customers/:id" element={<CustomerDetail />} />
          <Route path="data-intake" element={<DataIntake />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;