// src/pages/Register.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

function Register() {
  const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/auth/register', form);
      alert('Registered! Please login.');
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.error || 'Error registering');
    }
  };

  return (
    <div className="container d-flex vh-100 justify-content-center align-items-center">
      <form onSubmit={handleSubmit} className="border p-4 rounded shadow bg-white w-100" style={{ maxWidth: '400px' }}>
        <h2 className="mb-4 text-center">Register</h2>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Name"
            required
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="mb-3">
          <input
            type="email"
            className="form-control"
            placeholder="Email"
            required
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Mobile Number"
            required
            onChange={(e) => setForm({ ...form, mobile: e.target.value })}
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
        <button type="submit" className="btn btn-success w-100">Register</button>
        <p className="text-center mt-3">
          Already have an account? <a href="/login">Login</a>
        </p>
      </form>
    </div>
  );
}

export default Register;
