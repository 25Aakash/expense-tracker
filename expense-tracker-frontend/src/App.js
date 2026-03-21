import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthenticatedLayout from './components/AuthenticatedLayout';

import Login              from './pages/Login';
import Register           from './pages/Register';
import Landing            from './pages/Landing';
import Dashboard          from './pages/Dashboard';
import Reports            from './pages/Reports';
import Transactions       from './pages/Transactions';
import Profile            from './pages/Profile';
import Admin              from './pages/Admin';
import ManagerDashboard   from './pages/ManagerDashboard';
import ManagerUserDetail  from './pages/ManagerUserDetail';
import NotFound           from './pages/NotFound';
import BankTransactions  from './pages/BankTransactions';
import CashTransactions  from './pages/CashTransactions';
import AdminUserDetails  from './pages/AdminUserDetails';
import Categories from './pages/Categories';
import './i18n';
import './styles.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/* ---------- Error Boundary ---------- */
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <h2>Something went wrong</h2>
          <p>Please refresh the page or try again later.</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary mt-3">
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ---------- helper: never crash on bad JSON ---------- */
const safeParse = (val, fb = {}) => {
  if (!val || val === 'undefined') return fb;
  try { return JSON.parse(val); } catch { return fb; }
};

function App() {
  const permissions = safeParse(localStorage.getItem('permissions') || sessionStorage.getItem('permissions'));
  const user = safeParse(localStorage.getItem('user') || sessionStorage.getItem('user'));

  return (
    <ErrorBoundary>
    <Router>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar newestOnTop theme="colored" />
      <Routes>
        {/* Landing page at root */}
        <Route path="/" element={<Landing />} />
        {/* Public routes */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Authenticated routes at root level */}
        <Route path="/*" element={<AuthenticatedLayout />}> 
          <Route index                    element={<Dashboard />} />
          <Route path="dashboard"         element={<Dashboard />} />
          <Route path="categories" element={<Categories />} />
          <Route path="profile"           element={<Profile />} />
          <Route path="transactions"      element={<Transactions />} />
          <Route path="transactions/bank"  element={<BankTransactions />} />
          <Route path="transactions/cash"  element={<CashTransactions />} />
          {permissions.canAccessReports && (
            <Route path="reports"         element={<Reports />} />
          )}
          {user?.role === 'admin' && (
            <>
              <Route path="admin"             element={<Admin />} />
              <Route path="admin/users/:userId" element={<AdminUserDetails/>} />
            </>
          )}
          {(user?.role === 'manager' || user?.role === 'admin') && (
            <>
              <Route path="manager"           element={<ManagerDashboard />} />
              <Route path="manager/user/:id" element={<ManagerUserDetail />} />
            </>
          )}
          <Route path="*"                 element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
    </ErrorBoundary>
  );
}

export default App;
