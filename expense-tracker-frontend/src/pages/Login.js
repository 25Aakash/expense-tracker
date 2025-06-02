// src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

function Login() {
  const [form, setForm] = useState({ identifier: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="container d-flex vh-100 justify-content-center align-items-center">
      <form onSubmit={handleSubmit} className="border p-4 rounded shadow bg-white w-100" style={{ maxWidth: '400px' }}>
        <h2 className="mb-4 text-center">Login</h2>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Email or Mobile"
            required
            onChange={(e) => setForm({ ...form, identifier: e.target.value })}
          />
        </div>
        <div className="mb-3">
          <input
            type="password"
            className="form-control"
            placeholder="Password"
            required
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <button type="submit" className="btn btn-primary w-100">Login</button>
        <p className="text-center mt-3">
          Don't have an account? <a href="/register">Register</a>
        </p>
      </form>
    </div>
  );
}

export default Login;
