import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { registerRequest, verifyOtp } from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '' });
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => setCooldown(c => c - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerRequest(form);
      toast.success('OTP sent to your email');
      setStep(2);
      setCooldown(60);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyOtp({ email: form.email, otp });
      toast.success('Registration complete');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    try {
      await registerRequest(form);
      toast.success('New OTP sent');
      setCooldown(60);
    } catch {
      toast.error('Failed to resend OTP');
    }
  };

  return (
    <div className="vh-100 d-flex align-items-center justify-content-center bg-gradient" style={{
      background: 'linear-gradient(135deg, #dbeafe, #f0f9ff)',
    }}>
      <div className="card p-4 shadow glass-card border-0 animate__animated animate__fadeInUp" style={{
        maxWidth: 450,
        width: '100%',
        backdropFilter: 'blur(12px)',
        backgroundColor: 'rgba(255, 255, 255, 0.75)',
        borderRadius: '20px'
      }}>
        <h3 className="text-center mb-4 text-primary fw-bold">
          <i className="bi bi-person-plus-fill me-2"></i>
          Register
        </h3>

        {step === 1 ? (
          <form onSubmit={handleRegister}>
            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                id="name"
                placeholder="Name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
              <label htmlFor="name"><i className="bi bi-person"></i> Full Name</label>
            </div>

            <div className="form-floating mb-3">
              <input
                type="email"
                className="form-control"
                id="email"
                placeholder="Email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
              <label htmlFor="email"><i className="bi bi-envelope"></i> Email</label>
            </div>

            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                id="mobile"
                placeholder="Mobile"
                value={form.mobile}
                onChange={e => setForm({ ...form, mobile: e.target.value })}
                required
              />
              <label htmlFor="mobile"><i className="bi bi-phone"></i> Mobile</label>
            </div>

            <div className="form-floating mb-3 position-relative">
              <input
                type={showPw ? 'text' : 'password'}
                className="form-control pe-5"
                id="password"
                placeholder="Password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
              <label htmlFor="password"><i className="bi bi-lock"></i> Password</label>
              <span
                className="position-absolute top-50 end-0 translate-middle-y pe-3 text-muted"
                role="button"
                onClick={() => setShowPw(!showPw)}
              >
                {showPw ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <button className="btn btn-primary w-100 rounded-pill py-2 shadow-sm" disabled={loading}>
              {loading ? 'Sending OTP…' : 'Register'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                id="otp"
                placeholder="Enter OTP"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                required
              />
              <label htmlFor="otp"><i className="bi bi-shield-lock"></i> Enter OTP</label>
            </div>

            <button className="btn btn-success w-100 rounded-pill py-2 shadow-sm mb-2" disabled={loading}>
              {loading ? 'Verifying…' : 'Verify & Continue'}
            </button>

            <button
              type="button"
              className="btn btn-link w-100"
              onClick={resendOtp}
              disabled={cooldown > 0}
            >
              {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
            </button>
          </form>
        )}

        <p className="text-center mt-4 small">
          Already have an account? <a href="/login" className="text-decoration-none">Login</a>
        </p>
      </div>
    </div>
  );
}
