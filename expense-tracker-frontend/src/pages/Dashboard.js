// src/pages/Dashboard.js
import React, { useEffect, useState, useCallback } from 'react';
import API from '../services/api';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseChart from '../charts/ExpenseChart';
import IncomeForm from '../components/IncomeForm';
import ExpenseTrendChart from '../charts/ExpenseTrendChart';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { FaArrowUp, FaArrowDown, FaWallet } from 'react-icons/fa';   // icons for cards
import CountUp from 'react-countup';                                 // ✨ smooth counter

export default function Dashboard() {
  const { t } = useTranslation();

  /* ---------------- state ---------------- */
  const [expenses, setExpenses] = useState([]);
  const [incomes,  setIncomes] = useState([]);
  const [filteredExpenses, setFilteredExp] = useState([]);
  const [filteredIncomes,  setFilteredInc] = useState([]);
  const [filters] = useState({ category:'', startDate:'', endDate:'' });
  const [showForm, setShowForm] = useState('income');

  const permissions = JSON.parse(localStorage.getItem('permissions') || sessionStorage.getItem('permissions') || '{}');

  /* ---------------- fetch helpers ---------------- */
  const handleUnauthorized = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  };

  const fetchExpenses = async () => {
    try       { setExpenses((await API.get('/expenses')).data); }
    catch (e) { if (e.response?.status === 401) handleUnauthorized(); }
  };

  const fetchIncomes = async () => {
    try       { setIncomes((await API.get('/incomes')).data); }
    catch (e) { if (e.response?.status === 401) handleUnauthorized(); }
  };

  /* ---------------- filters ---------------- */
  const applyFilters = useCallback(() => {
    const dateIn = (d, s) => new Date(d) >= new Date(s);
    const dateLt = (d, e) => new Date(d) <= new Date(e);

    const exp = expenses.filter(e =>
      (!filters.category  || e.category === filters.category) &&
      (!filters.startDate || dateIn(e.date, filters.startDate)) &&
      (!filters.endDate   || dateLt(e.date,  filters.endDate))
    );
    const inc = incomes.filter(i =>
      (!filters.category  || i.category === filters.category) &&
      (!filters.startDate || dateIn(i.date, filters.startDate)) &&
      (!filters.endDate   || dateLt(i.date,  filters.endDate))
    );
    setFilteredExp(exp);
    setFilteredInc(inc);
  }, [expenses, incomes, filters]);

  /* ---------------- lifecycle ---------------- */
  useEffect(() => { fetchExpenses(); fetchIncomes(); }, []);
  useEffect(() => { applyFilters(); }, [expenses, incomes, filters, applyFilters]);

  /* ---------------- totals ---------------- */
  const totalIncome  = filteredIncomes.reduce((a, i) => a + i.amount, 0);
  const totalExpense = filteredExpenses.reduce((a, e) => a + e.amount, 0);
  const balance      = totalIncome - totalExpense;

  /* ---------------- reusable card ---------------- */
  const StatCard = ({ icon, title, value, color }) => (
    <div className="col">
      <div
        className={`card text-center border-0 shadow-sm h-100 glass-card`}
        style={{ backdropFilter:'blur(6px)', background:'rgba(255,255,255,0.7)' }}
      >
        <div className="card-body py-4">
          <div className={`mb-2 fs-4 text-${color}`}>{icon}</div>
          <h6 className={`fw-semibold text-${color} mb-1`}>{title}</h6>
          {/* CountUp makes the number roll up smoothly */}
          <h4 className="fw-bold">
            ₹<CountUp end={value} duration={1} decimals={2} />
          </h4>
        </div>
      </div>
    </div>
  );

  /* ---------------- UI ---------------- */
  return (
    <div className="container py-4">
      <LanguageSwitcher />

      <h4 className="text-primary fw-bold mb-4">{t('dashboard')}</h4>

      {/* === STAT CARDS === */}
      <div className="row row-cols-1 row-cols-md-3 g-3 mb-5">
        <StatCard
          icon={<FaArrowUp />}
          title={t('totalIncome')}
          value={totalIncome}
          color="success"
        />
        <StatCard
          icon={<FaArrowDown />}
          title={t('totalExpense')}
          value={totalExpense}
          color="danger"
        />
        <StatCard
          icon={<FaWallet />}
          title={t('netBalance')}
          value={balance}
          color="primary"
        />
      </div>

      {/* === ADD TXN BUTTONS === */}
      {permissions.canAdd && (
        <div className="text-center mb-5">
          <button
            className={`btn btn-success rounded-pill px-4 me-2 shadow ${showForm==='income' && 'btn-lg'}`}
            data-bs-toggle="modal"
            data-bs-target="#addTransactionModal"
            onClick={() => setShowForm('income')}
          >
            {t('addIncome')}
          </button>
          <button
            className={`btn btn-danger rounded-pill px-4 shadow ${showForm==='expense' && 'btn-lg'}`}
            data-bs-toggle="modal"
            data-bs-target="#addTransactionModal"
            onClick={() => setShowForm('expense')}
          >
            {t('addExpense')}
          </button>
        </div>
      )}

      {/* === CHARTS === */}
      <div className="row">
        <div className="col-12 col-md-6 mb-4">
          <ExpenseTrendChart expenses={filteredExpenses} />
        </div>
        <div className="col-12 col-md-6 mb-4">
          <ExpenseChart expenses={filteredExpenses} />
        </div>
      </div>

      {/* === ADD TXN MODAL === */}
      {permissions.canAdd && (
        <div className="modal fade" id="addTransactionModal" tabIndex="-1" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  {showForm === 'income' ? t('addIncome') : t('addExpense')}
                </h5>
                <button className="btn-close" data-bs-dismiss="modal" />
              </div>

              <div className="modal-body pt-0">
                {/* toggle pills */}
                <div className="d-flex justify-content-center gap-3 my-3">
                  <button
                    className={`btn rounded-pill ${showForm==='income' ? 'btn-success' : 'btn-outline-success'}`}
                    onClick={() => setShowForm('income')}
                  >{t('income')}</button>
                  <button
                    className={`btn rounded-pill ${showForm==='expense' ? 'btn-danger' : 'btn-outline-danger'}`}
                    onClick={() => setShowForm('expense')}
                  >{t('expense')}</button>
                </div>

                {showForm === 'income'
                  ? <IncomeForm  onAdd={fetchIncomes}  disabled={!permissions.canAdd} />
                  : <ExpenseForm onAdd={fetchExpenses} disabled={!permissions.canAdd} />}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
