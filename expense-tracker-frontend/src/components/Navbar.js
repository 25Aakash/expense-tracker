// src/components/Navbar.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light px-4 shadow-sm">
      <a className="navbar-brand" href="/">Expense Tracker</a>
      <div className="ml-auto">
        <button onClick={logout} className="btn btn-outline-danger">Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
