// src/pages/Login.js
import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import API from '../services/api';
import { toast } from 'react-toastify';
import { updatePerms } from '../utils/permissionStore';
import 'bootstrap-icons/font/bootstrap-icons.css';          // Bootstrap Icons

export default function Login() {
  /* ---------- state ---------- */
  const [form,   setForm] = useState({ identifier: '', password: '' });
  const [busy,   setBusy] = useState(false);
  const [showPw, setShow] = useState(false);

  /* ---------- submit ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await API.post('/auth/login', form);

      /* cache everything */
      localStorage.setItem('token',        data.token);
      localStorage.setItem('permissions',  JSON.stringify(data.permissions || {}));
      localStorage.setItem('role',         data.user.role);
      localStorage.setItem('name',         data.user.name);
      localStorage.setItem('email',        data.user.email);

      toast.success('Login successful');
      updatePerms(data.permissions || {});

      const dest =
        data.user.role === 'admin'   ? '/admin'   :
        data.user.role === 'manager' ? '/manager' :
                                       '/dashboard';

      window.location.replace(dest);    // full reload
    } catch {
      toast.error('Invalid credentials');
    }
    setBusy(false);
  };

  /* ---------- ui ---------- */
  return (
    <div
      className="vh-100 d-flex align-items-center justify-content-center"
      style={{ background: 'linear-gradient(135deg, #dbeafe, #f0f9ff)' }}
    >
      <div
        className="card p-4 shadow-lg border-0 animate__animated animate__fadeInUp"
        style={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 20,
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(255,255,255,0.75)'
        }}
      >
        {/* header */}
        <h3 className="text-center mb-4 text-primary fw-bold">
          <i className="bi bi-person-circle me-2"></i>
          Login
        </h3>

        {/* form */}
        <form onSubmit={handleSubmit}>
          {/* identifier */}
          <div className="form-floating mb-3">
            <input
              id="identifier"
              type="text"
              className="form-control"
              placeholder="Email or Mobile"
              value={form.identifier}
              onChange={e => setForm({ ...form, identifier: e.target.value })}
              required
            />
            <label htmlFor="identifier">
              <i className="bi bi-envelope"></i> Email or Mobile
            </label>
          </div>

          {/* password */}
          <div className="form-floating mb-4 position-relative">
            <input
              id="password"
              type={showPw ? 'text' : 'password'}
              className="form-control pe-5"
              placeholder="Password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
            <label htmlFor="password">
              <i className="bi bi-lock"></i> Password
            </label>

            {/* eye toggle */}
            <span
              role="button"
              className="position-absolute top-50 end-0 translate-middle-y pe-3 text-muted"
              onClick={() => setShow(!showPw)}
            >
              {showPw ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* submit */}
          <button className="btn btn-primary w-100 rounded-pill py-2 shadow-sm" disabled={busy}>
            {busy ? 'Logging in…' : 'Login'}
          </button>
        </form>

        {/* footnote */}
        <p className="text-center small mt-4 mb-0">
          Don’t have an account?{' '}
          <a href="/register" className="text-decoration-none">Register</a>
        </p>
      </div>
    </div>
  );
}
