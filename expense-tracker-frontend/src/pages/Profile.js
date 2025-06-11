import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

function Profile() {
  const [user, setUser] = useState(null);

  const fetchProfile = async () => {
    try {
      const res = await API.get('/profile/me');
      setUser(res.data);
    } catch (err) {
      toast.error('Failed to load profile');
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="container py-5">
      <div className="card shadow-sm mx-auto" style={{ maxWidth: '400px' }}>
        <div className="card-body text-center">
          <img
            src="https://ui-avatars.com/api/?name='+{user?.name || 'User'}+'&background=random"
            alt="Avatar"
            className="rounded-circle mb-3 border"
            style={{ width: '80px', height: '80px' }}
          />
          <h4 className="mb-2">{user?.name || 'User'}</h4>

          <p className="text-muted mb-1"><strong>Email:</strong> {user?.email}</p>
          <p className="text-muted mb-1"><strong>Mobile:</strong> {user?.mobile}</p>
          <p className="text-muted mb-1">
            <strong>Account Created:</strong> {user ? format(new Date(user.createdAt), 'yyyy-MM-dd') : ''}
          </p>
          <p className="text-muted mb-3">
            <strong>Role:</strong> {user?.isAdmin ? 'Admin' : 'User'}
          </p>

          <button className="btn btn-danger mt-3 rounded-pill" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
