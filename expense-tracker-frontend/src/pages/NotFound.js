// src/pages/NotFound.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="container text-center mt-5">
      <h1 className="display-4 text-danger">404</h1>
      <p className="lead">Oops! The page you're looking for doesn't exist.</p>
      <button className="btn btn-primary mt-3" onClick={() => navigate('/')}>
        Go to Dashboard
      </button>
    </div>
  );
}

export default NotFound;
