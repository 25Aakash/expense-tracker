import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Navbar() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [role, setRole] = useState(localStorage.getItem('role'));
  const [email, setEmail] = useState(localStorage.getItem('email'));
  const [permissions, setPermissions] = useState(
    JSON.parse(localStorage.getItem('permissions') || '{}')
  );

  useEffect(() => {
    const el = document.getElementById('mobileMenu');
    if (el && window.bootstrap) new window.bootstrap.Offcanvas(el);
  }, []);

  useEffect(() => {
    const sync = () => {
      setRole(localStorage.getItem('role'));
      setEmail(localStorage.getItem('email'));
      setPermissions(JSON.parse(localStorage.getItem('permissions') || '{}'));
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const closeMenu = () => {
    const el = document.getElementById('mobileMenu');
    window.bootstrap?.Offcanvas.getInstance(el)?.hide();
  };

  const navLinks = [
    { to: '/', label: t('dashboard'), icon: 'bi-speedometer2' },
    { to: '/transactions', label: t('transactions'), icon: 'bi-wallet2' },
    { to: '/categories', label: t('categories'), icon: 'bi-grid' },
    ...(permissions.canAccessReports
      ? [{ to: '/reports', label: t('reports'), icon: 'bi-bar-chart' }]
      : []),
    { to: '/profile', label: t('profile'), icon: 'bi-person-circle' },
    ...(role === 'admin'
      ? [{ to: '/admin', label: t('admin'), icon: 'bi-shield-lock' }]
      : []),
    ...(role === 'manager'
      ? [{ to: '/manager', label: t('manager'), icon: 'bi-clipboard-data' }]
      : []),
  ];

  return (
    <>
      <nav className="navbar navbar-light bg-white shadow-sm sticky-top px-3 py-2">
        <div className="container-fluid">
          <NavLink className="navbar-brand fw-bold text-primary" to="/">
            💰 {t('appName')}
          </NavLink>

          <button
            className="btn btn-outline-primary d-lg-none"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#mobileMenu"
          >
            <span className="navbar-toggler-icon" />
          </button>

          {/* Desktop Navigation */}
          <div className="d-none d-lg-flex align-items-center gap-4">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                className={({ isActive }) =>
                  'nav-link d-flex align-items-center gap-1' + (isActive ? ' text-primary fw-semibold' : '')
                }
                to={link.to}
              >
                <i className={`bi ${link.icon}`} /> {link.label}
              </NavLink>
            ))}
            <button className="btn btn-outline-danger btn-sm" onClick={logout}>
              <i className="bi bi-box-arrow-right" /> {t('logout')}
            </button>
            <span className="small text-muted ms-2">{email}</span>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className="offcanvas offcanvas-start" tabIndex="-1" id="mobileMenu">
        <div className="offcanvas-header">
          <h5 className="offcanvas-title text-primary">{t('appName')}</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" />
        </div>
        <div className="offcanvas-body d-flex flex-column gap-3">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              className={({ isActive }) =>
                'nav-link d-flex align-items-center gap-2' + (isActive ? ' text-primary fw-bold' : '')
              }
              to={link.to}
              onClick={closeMenu}
            >
              <i className={`bi ${link.icon}`} /> {link.label}
            </NavLink>
          ))}
          <button className="btn btn-outline-danger mt-4" onClick={logout}>
            <i className="bi bi-box-arrow-right" /> {t('logout')}
          </button>
        </div>
      </div>
    </>
  );
}

export default Navbar;
