import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { toast } from 'react-toastify';

function Register() {
  const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/auth/register', form);
      toast.success("Registration successful");
      navigate('/login');
    } catch (err) {
      toast.error("Registration failed");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow-sm p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <h3 className="text-center mb-4 text-primary fw-bold">Register</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input type="text" className="form-control" placeholder="Name" required
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="mb-3">
            <input type="email" className="form-control" placeholder="Email" required
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="mb-3">
            <input type="text" className="form-control" placeholder="Mobile" required
              onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
          </div>
          <div className="mb-3">
            <input type="password" className="form-control" placeholder="Password" required
              onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <button className="btn btn-primary w-100 rounded-pill">Register</button>
        </form>
        <p className="text-center mt-3 small">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
}

export default Register;
