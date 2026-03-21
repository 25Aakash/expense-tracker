// src/pages/Profile.js
import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { deleteAccount } from '../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { FaSignOutAlt, FaUserCircle, FaTrashAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function Profile() {
  const { t } = useTranslation();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

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
    sessionStorage.clear();
    window.location.replace('/login');
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      toast.error('Please enter your password');
      return;
    }
    try {
      setDeleteLoading(true);
      await deleteAccount({ password: deletePassword });
      toast.success('Account deleted successfully');
      setShowDeleteModal(false);
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete account');
    } finally {
      setDeleteLoading(false);
    }
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

          {/* delete account */}
          <button
            className="btn btn-outline-danger rounded-pill px-4 shadow-sm mt-2"
            onClick={() => { setDeletePassword(''); setShowDeleteModal(true); }}
            disabled={loading}
          >
            <FaTrashAlt className="me-2" />
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: '16px' }}>
              <div className="modal-header border-0">
                <h5 className="modal-title text-danger fw-bold">Delete Account</h5>
                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)} disabled={deleteLoading}></button>
              </div>
              <div className="modal-body">
                <p className="text-muted small">
                  This will permanently delete your account and all your data (expenses, incomes, categories). This action cannot be undone.
                </p>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter your password to confirm"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  disabled={deleteLoading}
                />
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)} disabled={deleteLoading}>Cancel</button>
                <button className="btn btn-danger" onClick={handleDeleteAccount} disabled={deleteLoading}>
                  {deleteLoading ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
