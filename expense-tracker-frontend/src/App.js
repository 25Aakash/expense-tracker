import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthenticatedLayout from './components/AuthenticatedLayout';
import NotFound from './pages/NotFound';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes inside Layout */}
        <Route path="/" element={<Layout><AuthenticatedLayout><Dashboard /></AuthenticatedLayout></Layout>} />
        <Route path="/transactions" element={<Layout><AuthenticatedLayout><Transactions /></AuthenticatedLayout></Layout>} />
        <Route path="/reports" element={<Layout><AuthenticatedLayout><Reports /></AuthenticatedLayout></Layout>} />
        <Route path="/profile" element={<Layout><AuthenticatedLayout><Profile /></AuthenticatedLayout></Layout>} />
        <Route path="/admin" element={<Layout><AuthenticatedLayout><Admin /></AuthenticatedLayout></Layout>} />
        <Route path="*" element={<Layout><NotFound /></Layout>} />

      </Routes>
    </Router>
  );
}

export default App;
