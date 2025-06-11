import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { toast } from 'react-toastify';

function Login() {
  const [form, setForm] = useState({ identifier: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', form);
      const token = res.data.token;
      localStorage.setItem('token', token);
      
      // ✅ Decode JWT (without library)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isAdmin = payload.isAdmin;
      localStorage.setItem('isAdmin', isAdmin);

      toast.success("Login successful");
      
      if (isAdmin) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      toast.error("Invalid credentials");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow-sm p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <h3 className="text-center mb-4 text-primary fw-bold">Login</h3>
        <form onSubmit={handleSubmit}>
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
          <button className="btn btn-primary w-100 rounded-pill">Login</button>
        </form>
        <p className="text-center mt-3 small">
          Don't have an account? <a href="/register">Register</a>
        </p>
      </div>
    </div>
  );
}

export default Login;
