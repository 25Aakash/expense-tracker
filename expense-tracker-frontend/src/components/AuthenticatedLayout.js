import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Layout from './Layout';
import i18n from '../i18n';

function AuthenticatedLayout() {
  // Run useEffect unconditionally
  useEffect(() => {
    const saved = localStorage.getItem('i18nextLng');
    if (saved && saved !== i18n.language) {
      i18n.changeLanguage(saved);
    }
  }, []);

  // Run return AFTER all hooks
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export default AuthenticatedLayout;
