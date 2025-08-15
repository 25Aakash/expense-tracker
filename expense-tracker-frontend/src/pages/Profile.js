// src/pages/Profile.js
import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function Profile() {
  const { t } = useTranslation();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await API.get('/profile/me');
        setUser(data);
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.clear();
          window.location.replace('/login');
          return;
        }
        toast.error(t('failedToLoadProfile'));
      } finally {
        setLoading(false);
      }
    })();
  }, [t]);

  const avatarSrc = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    user?.name || 'User'
  )}&background=random&bold=true`;

  const handleLogout = () => {
    localStorage.clear();
    window.location.replace('/login');
  };

  return (
    <div
      className="min-vh-100 d-flex justify-content-center align-items-center"
      style={{
        background:
          'linear-gradient(135deg, #e0f2fe 0%, #f5f3ff 40%, #fde68a 100%)',
      }}
    >
      <div
        className="card border-0 shadow-lg glass-card"
        style={{
          maxWidth: 420,
          width: '100%',
          backdropFilter: 'blur(10px)',
          background: 'rgba(255,255,255,0.75)',
          borderRadius: '20px',
        }}
      >
        <div className="card-body text-center p-4">
          {/* avatar */}
          <img
            src={avatarSrc}
            alt="avatar"
            className="rounded-circle border mb-3"
            style={{ width: 96, height: 96 }}
          />

          {/* name */}
          <h4 className="fw-bold mb-1">
            {user?.name ?? t('loading')}
          </h4>

          {/* contact */}
          <p className="text-muted small mb-2">
            <i className="bi bi-envelope me-1"></i>
            {user?.email ?? '—'}
            <br />
            <i className="bi bi-phone me-1"></i>
            {user?.mobile ?? '—'}
          </p>

          {/* joined and role */}
          <div className="d-flex justify-content-center gap-3 mb-4">
            <div>
              <span className="badge bg-light text-dark">
                <i className="bi bi-calendar3 me-1"></i>
                {t('joined')}: {user ? format(new Date(user.createdAt), 'yyyy-MM-dd') : '—'}
              </span>
            </div>
            <div>
              <span className="badge bg-primary-subtle text-primary">
                <FaUserCircle className="me-1" />
                {t(user?.role?.toLowerCase() || 'user')}
              </span>
            </div>
          </div>

          {/* logout */}
          <button
            className="btn btn-danger rounded-pill px-4 shadow-sm"
            onClick={handleLogout}
            disabled={loading}
          >
            <FaSignOutAlt className="me-2" />
            {t('logout')}
          </button>
        </div>
      </div>
    </div>
  );
}
