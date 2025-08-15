import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAllUsers,
  deleteUser,
  updateUserRole
} from '../services/api';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import 'bootstrap-icons/font/bootstrap-icons.css';

const ROLES = ['user', 'manager', 'admin'];

function Admin() {
  const [users, setUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const nav = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getAllUsers();
        setUsers(data);
        setManagers(data.filter((u) => u.role === 'manager'));
      } catch {
        toast.error(t('loadUsersError'));
      }
    })();
  }, [t]);

  const handleDelete = async (id) => {
    if (!window.confirm(t('confirmDeleteUser'))) return;
    try {
      await deleteUser(id);
      setUsers((u) => u.filter((x) => x._id !== id));
      toast.success(t('userDeleted'));
    } catch {
      toast.error(t('deleteFailed'));
    }
  };

  const patchUser = async (id, body) => {
    try {
      await updateUserRole(id, body);
      setUsers((list) =>
        list.map((u) => (u._id === id ? { ...u, ...body } : u))
      );
      toast.success(t('userUpdated'));
    } catch {
      toast.error(t('updateFailed'));
    }
  };

  return (
    <div
      className="min-vh-100 d-flex flex-column"
      style={{ background: 'linear-gradient(135deg,#e0f2fe,#f0f9ff,#fff7ed)' }}
    >
      <div className="container py-4">
        <h3 className="mb-4 text-primary d-flex align-items-center gap-2">
          <i className="bi bi-shield-lock-fill"></i> {t('adminUserMgmt')}
        </h3>

        <div
          className="glass-card p-3 rounded-4 shadow-sm"
          style={{ backdropFilter: 'blur(10px)', background: 'rgba(255, 255, 255, 0.9)' }}
        >
          <div className="table-responsive">
            <table className="table align-middle table-hover">
              <thead className="table-light">
                <tr>
                  <th>{t('name')}</th>
                  <th>{t('email')}</th>
                  <th style={{ width: 120 }}>{t('role')}</th>
                  <th style={{ width: 200 }}>{t('manager')}</th>
                  <th className="text-end" style={{ width: 130 }}>{t('actions')}</th>
                </tr>
              </thead>

              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td className="small text-muted">{u.email}</td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={u.role}
                        onChange={(e) => patchUser(u._id, { role: e.target.value })}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{t(r)}</option>
                        ))}
                      </select>
                    </td>

                    <td>
                      {u.role === 'admin' ? (
                        <span className="text-muted">—</span>
                      ) : (
                        <select
                          className="form-select form-select-sm"
                          value={u.managerId ? u.managerId._id : ''}
                          onChange={(e) =>
                            patchUser(u._id, { managerId: e.target.value || null })
                          }
                        >
                          <option value="">{t('noManager')}</option>
                          {managers.map((m) => (
                            <option key={m._id} value={m._id}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>

                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => nav(`/admin/users/${u._id}`)}
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(u._id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}

                {users.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">
                      {t('noUsers')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;
