import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

export default function Landing() {
  return (
    <div className="landing-bg d-flex align-items-center justify-content-center min-vh-100">
      <div className="text-center p-4 rounded shadow-lg landing-card">
        <img src="/logo192.png" alt="App Logo" style={{width:80, marginBottom:16}} />
        <h1 className="fw-bold mb-3">Welcome to DailyBook</h1>
        <p className="mb-4 text-secondary">Track your expenses and income, manage categories, and get insightful reports. Simple, secure, and fast.</p>
        <div className="d-flex gap-3 justify-content-center">
          <Link to="/login" className="btn btn-primary px-4">Login</Link>
          <Link to="/register" className="btn btn-outline-primary px-4">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
