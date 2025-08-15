// src/pages/AdminUserDetail.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserIncomes, getUserExpenses } from '../services/api';
import { format, parseISO } from 'date-fns';
import CountUp from 'react-countup';
import { toast } from 'react-toastify';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useTranslation } from 'react-i18next';

function AdminUserDetail() {
  const { userId } = useParams();
  const nav = useNavigate();
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    (async () => {
      try {
        const [iRes, eRes] = await Promise.all([
          getUserIncomes(userId),
          getUserExpenses(userId),
        ]);
        setIncomes(iRes.data);
        setExpenses(eRes.data);
      } catch {
        toast.error(t('errorLoadingData') || 'Failed to load data');
      }
    })();
  }, [userId, t]);

  const totalInc = incomes.reduce((s, i) => s + i.amount, 0);
  const totalExp = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div
      className="min-vh-100 py-4"
      style={{ background: 'linear-gradient(135deg,#f0f9ff,#e0f2fe,#fde68a)' }}
    >
      <div className="container mb-3">
        <button
          className="btn btn-outline-primary rounded-pill d-flex align-items-center gap-1"
          onClick={() => nav('/admin')}
        >
          <i className="bi bi-arrow-left-circle"></i> {t('back')}
        </button>
      </div>

      <div className="container">
        <div className="row g-4">
          {/* Income Card */}
          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow glass-card h-100"
              style={{ backdropFilter: 'blur(8px)', background: 'rgba(255,255,255,0.7)' }}>
              <div className="card-header bg-transparent border-0 pb-0">
                <h4 className="text-success fw-bold mb-0">
                  {t('incomes')} &nbsp;
                  <span className="badge bg-success-subtle text-success fw-normal">
                    ₹<CountUp end={totalInc} duration={0.6} decimals={2} />
                  </span>
                </h4>
              </div>
              <div className="card-body p-0">
                {incomes.length === 0 ? (
                  <p className="text-center text-muted py-4">{t('noIncomes')}</p>
                ) : (
                  <ul className="list-group list-group-flush">
                    {incomes.map((i) => (
                      <li key={i._id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                        style={{ background: 'transparent' }}>
                        <span>{i.category}</span>
                        <span className="fw-semibold">
                          ₹<CountUp end={i.amount} duration={0.4} decimals={2} />
                          <small className="d-block text-muted">
                            {format(parseISO(i.date), 'yyyy-MM-dd')}
                          </small>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Expense Card */}
          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow glass-card h-100"
              style={{ backdropFilter: 'blur(8px)', background: 'rgba(255,255,255,0.7)' }}>
              <div className="card-header bg-transparent border-0 pb-0">
                <h4 className="text-danger fw-bold mb-0">
                  {t('expenses')} &nbsp;
                  <span className="badge bg-danger-subtle text-danger fw-normal">
                    ₹<CountUp end={totalExp} duration={0.6} decimals={2} />
                  </span>
                </h4>
              </div>
              <div className="card-body p-0">
                {expenses.length === 0 ? (
                  <p className="text-center text-muted py-4">{t('noExpenses')}</p>
                ) : (
                  <ul className="list-group list-group-flush">
                    {expenses.map((e) => (
                      <li key={e._id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                        style={{ background: 'transparent' }}>
                        <span>{e.category}</span>
                        <span className="fw-semibold">
                          ₹<CountUp end={e.amount} duration={0.4} decimals={2} />
                          <small className="d-block text-muted">
                            {format(parseISO(e.date), 'yyyy-MM-dd')}
                          </small>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default AdminUserDetail;
