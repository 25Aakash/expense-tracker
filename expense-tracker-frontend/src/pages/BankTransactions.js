// src/pages/BankTransactions.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import TransactionList from '../components/TransactionList';
import { useTranslation } from 'react-i18next';
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function BankTransactions() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div
      className="min-vh-100 d-flex flex-column align-items-center py-4"
      style={{
        background: 'linear-gradient(135deg,#f0f9ff,#e0f2fe,#fde68a)',
      }}
    >
      <div
        className="glass-card shadow-lg w-100 p-4"
        style={{
          maxWidth: 900,
          backdropFilter: 'blur(12px)',
          background: 'rgba(255,255,255,0.85)',
          borderRadius: '20px',
        }}
      >
        <h3 className="fw-bold text-primary text-center mb-4">
          🏦 {t('bankTransactions')}
        </h3>

        {/* list filtered to Bank only */}
        <TransactionList method="Bank" />

        <div className="text-center mt-4">
          <button
            className="btn btn-outline-primary rounded-pill px-4 d-inline-flex align-items-center gap-2"
            onClick={() => navigate('/transactions')}
          >
            <i className="bi bi-arrow-left-circle"></i>
            {t('backToAll')}
          </button>
        </div>
      </div>
    </div>
  );
}
