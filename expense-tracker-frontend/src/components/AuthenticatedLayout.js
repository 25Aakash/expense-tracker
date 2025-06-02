// src/components/AuthenticatedLayout.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import Navbar from './Navbar';

const AuthenticatedLayout = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) return <Navigate to="/login" />;

  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

export default AuthenticatedLayout;
