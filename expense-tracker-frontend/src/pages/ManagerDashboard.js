import React, { useEffect, useState } from 'react';
import {
  getTeamUsers,
  addUserUnderManager,
  updateUserPermissions,
  deleteUserUnderManager
} from '../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import 'bootstrap-icons/font/bootstrap-icons.css';

const PERMS = [
  'canAdd', 'canEdit', 'canDelete',
  'canViewTeam', 'canManageUsers',
  'canExport', 'canAccessReports'
];

export default function ManagerDashboard() {
  const [users, setUsers] = useState([]);
  const [show, setShow] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: '', email: '', mobile: '', password: '',
    permissions: Object.fromEntries(PERMS.map(k => [k, false]))
  });
  const nav = useNavigate();

  const load = async () => {
    try {
      const { data } = await getTeamUsers();
      setUsers(data);
    } catch {
      toast.error(t('toast.fetchFailed'));
    }
  };

  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    try {
      await addUserUnderManager(form);
      toast.success(t('toast.userAdded'));
      setForm({
        name: '', email: '', mobile: '', password: '',
        permissions: Object.fromEntries(PERMS.map(k => [k, false]))
      });
      setShow(false);
      setShowPassword(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || t('toast.addFailed'));
    }
  };

  const remove = async (id) => {
    if (!window.confirm(t('confirmDeleteUser'))) return;
    try {
      await deleteUserUnderManager(id);
      toast.success(t('toast.userDeleted'));
      setUsers(u => u.filter(x => x._id !== id));
    } catch {
      toast.error(t('toast.deleteFailed'));
    }
  };

  const toggle = (uId, key) => {
    const user = users.find(u => u._id === uId);
    const patched = { ...user.permissions, [key]: !user.permissions[key] };
    updateUserPermissions(uId, patched)
      .then(() => {
        toast.success(t('toast.updated'));
        setUsers(xs => xs.map(x => x._id === uId ? { ...x, permissions: patched } : x));
      })
      .catch(() => toast.error(t('toast.updateFailed')));
  };

  const goDetail = id => nav(`/manager/user/${id}`);

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary">👥 {t('managerDashboard.title')}</h2>
        <button className="btn btn-outline-primary" onClick={() => setShow(true)}>
          {t('managerDashboard.addMember')}
        </button>
      </div>

      <div className="row g-3 mb-5">
        {users.map(u => (
          <div className="col-md-4" key={u._id}>
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">{u.name}</h5>
                <p className="text-muted small mb-3">{u.email}</p>

                <details>
                  <summary className="small fw-semibold mb-2">{t('permissions')}</summary>
                  <ul className="list-unstyled small mb-3">
                    {PERMS.map(k => (
                      <li key={k}>
                        <label className="form-check-label">
                          <input
                            type="checkbox"
                            className="form-check-input me-1"
                            checked={u.permissions?.[k] || false}
                            onChange={() => toggle(u._id, k)}
                          />
                          {t(`perm.${k}`)}
                        </label>
                      </li>
                    ))}
                  </ul>
                </details>

                <div className="d-flex justify-content-between">
                  <button className="btn btn-sm btn-outline-primary" onClick={() => goDetail(u._id)}>
                    <i className="bi bi-eye"></i> {t('viewData')}
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => remove(u._id)}>
                    <i className="bi bi-trash3"></i> {t('delete')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {users.length === 0 && (
          <p className="text-center text-muted">{t('noUsers')}</p>
        )}
      </div>

      {/* Add Team Member Modal */}
      {show && (
        <div className="modal fade show d-block" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{t('managerDashboard.addMember')}</h5>
                <button className="btn-close" onClick={() => setShow(false)} />
              </div>
              <div className="modal-body">
                <form onSubmit={add} className="row g-3">
                  {['name','email','mobile'].map(f => (
                    <div className="col-6" key={f}>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder={t(`form.${f}`)}
                        value={form[f]}
                        onChange={e => setForm({ ...form, [f]: e.target.value })}
                      />
                    </div>
                  ))}

                  {/* Password field with show/hide toggle */}
                  <div className="col-6">
                    <div className="position-relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        className="form-control"
                        placeholder={t('form.password')}
                        value={form.password}
                        onChange={e => setForm({ ...form, password: e.target.value })}
                      />
                      <span
                        role="button"
                        className="position-absolute top-50 end-0 translate-middle-y pe-3 text-muted"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ cursor: 'pointer' }}
                      >
                        <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                      </span>
                    </div>
                  </div>

                  <div className="col-12">
                    <label className="form-label">{t('permissions')}</label>
                    {PERMS.map(k => (
                      <div className="form-check form-check-inline" key={k}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={form.permissions[k]}
                          onChange={e =>
                            setForm({
                              ...form,
                              permissions: { ...form.permissions, [k]: e.target.checked }
                            })
                          }
                        />
                        <label className="form-check-label small">{t(`perm.${k}`)}</label>
                      </div>
                    ))}
                  </div>

                  <div className="col-12">
                    <button className="btn btn-primary w-100" type="submit">
                      {t('add')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
