import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { toast } from 'react-toastify';
import { parseISO, format } from 'date-fns';
import CountUp from 'react-countup';
import { useTranslation } from 'react-i18next';
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function ManagerUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [user,     setUser]     = useState(null);
  const [incomes,  setIncomes]  = useState([]);
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const uRes = await API.get(`/manager/user/${id}`);
        setUser(uRes.data);
        const [iRes, eRes] = await Promise.all([
          API.get(`/manager/user/${id}/incomes`),
          API.get(`/manager/user/${id}/expenses`)
        ]);
        setIncomes(iRes.data);
        setExpenses(eRes.data);
      } catch {
        toast.error(t('toast.fetchFailed'));
      }
    })();
  }, [id, t]);

  if (!user) return <p className="text-center mt-5">{t('loading')}</p>;

  const totalInc = incomes.reduce((s, i) => s + i.amount, 0);
  const totalExp = expenses.reduce((s, e) => s + e.amount, 0);

  const Row = ({ rec }) => (
    <li className="list-group-item d-flex justify-content-between align-items-center"
        style={{ background: 'transparent' }}>
      <span>{rec.category}</span>
      <span className="fw-semibold">
        ₹<CountUp end={rec.amount} duration={0.4} decimals={2} />
        <small className="d-block text-muted">
          {format(parseISO(rec.date), 'yyyy-MM-dd')}
        </small>
      </span>
    </li>
  );

  return (
    <div className="min-vh-100 py-4"
         style={{ background: 'linear-gradient(135deg,#f0f9ff,#e0f2fe,#fde68a)' }}>
      {/* Back Button */}
      <div className="container mb-3">
        <button
          className="btn btn-outline-primary rounded-pill d-flex align-items-center gap-1"
          onClick={() => navigate('/manager')}
        >
          <i className="bi bi-arrow-left-circle"></i> {t('back')}
        </button>
      </div>

      {/* Header */}
      <div className="container mb-4">
        <h3 className="fw-bold text-primary mb-1">👤 {user.name}</h3>
        <p className="text-muted">{user.email}</p>
      </div>

      {/* Income & Expense Cards */}
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
                    {incomes.map(i => <Row key={i._id} rec={i} />)}
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
                    {expenses.map(e => <Row key={e._id} rec={e} />)}
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
