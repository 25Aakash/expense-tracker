import React, { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const email = localStorage.getItem('email');

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // This function closes sidebar after link click
  const handleNavClose = () => {
    const offcanvasEl = document.getElementById('mobileMenu');
    if (offcanvasEl) {
      const bsOffcanvas = window.bootstrap?.Offcanvas.getInstance(offcanvasEl);
      if (bsOffcanvas) bsOffcanvas.hide();
    }
  };

  // Initialize Bootstrap Offcanvas instance (important for React controlled DOM)
  useEffect(() => {
    const offcanvasEl = document.getElementById('mobileMenu');
    if (offcanvasEl && window.bootstrap) {
      new window.bootstrap.Offcanvas(offcanvasEl);
    }
  }, []);

  return (
    <>
      {/* Top Navbar */}
      <nav className="navbar navbar-light bg-white shadow-sm sticky-top px-3 py-2">
        <div className="container-fluid">
          <NavLink className="navbar-brand fw-bold text-primary" to="/">
            💰 ExpenseTracker
          </NavLink>

          <button className="btn btn-outline-primary d-lg-none" type="button" data-bs-toggle="offcanvas" data-bs-target="#mobileMenu">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="d-none d-lg-flex align-items-center gap-3">
            <NavLink className="nav-link" to="/">Dashboard</NavLink>
            <NavLink className="nav-link" to="/transactions">Transactions</NavLink>
            <NavLink className="nav-link" to="/reports">Reports</NavLink>
            <NavLink className="nav-link" to="/profile">Profile</NavLink>
            {isAdmin && (
              <NavLink className="nav-link" to="/admin">Admin</NavLink>
            )}
            <button className="btn btn-outline-danger btn-sm" onClick={logout}>Logout</button>
            <span className="small text-muted">{email}</span>
          </div>
        </div>
      </nav>

      {/* Offcanvas Sidebar */}
      <div className="offcanvas offcanvas-start" tabIndex="-1" id="mobileMenu">
        <div className="offcanvas-header">
          <h5 className="offcanvas-title text-primary">MyExpenseTracker</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas"></button>
        </div>
        <div className="offcanvas-body d-flex flex-column gap-3">
          <NavLink className="nav-link" to="/" onClick={handleNavClose}>Dashboard</NavLink>
          <NavLink className="nav-link" to="/transactions" onClick={handleNavClose}>Transactions</NavLink>
          <NavLink className="nav-link" to="/reports" onClick={handleNavClose}>Reports</NavLink>
          <NavLink className="nav-link" to="/profile" onClick={handleNavClose}>Profile</NavLink>
          {isAdmin && (
            <NavLink className="nav-link" to="/admin" onClick={handleNavClose}>Admin</NavLink>
          )}
          <button className="btn btn-outline-danger mt-3" onClick={logout}>Logout</button>
        </div>
      </div>
    </>
  );
}

export default Navbar;
