// src/pages/Reports.js
import React, { useEffect, useState } from 'react';
import API from '../services/api';
import DonutChart from '../charts/DonutChart';
import { parseISO, isToday, isThisWeek, isThisMonth, isThisYear } from 'date-fns';
import CountUp from 'react-countup';
import {FaArrowUp,FaArrowDown,FaWallet,FaCalendarAlt,FaUniversity,FaMoneyBillWave,} from 'react-icons/fa';
import { BsThreeDotsVertical } from 'react-icons/bs';
import Dropdown from 'react-bootstrap/Dropdown';
import { useTranslation } from 'react-i18next';

import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Reports() {
  const { t } = useTranslation();

  /* ----------------- raw data ----------------- */
  const [incomes,  setIncomes]  = useState([]);
  const [expenses, setExpenses] = useState([]);

  /* time filters */
  const [filter,   setFilter]   = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate,   setToDate]   = useState('');
  const today                   = new Date().toISOString().slice(0, 10);
  const [tmpFrom, setTmpFrom]   = useState(today);
  const [tmpTo,   setTmpTo]     = useState(today);

  /* modal state (Bank | Cash | null) */
  const [methodModal, setMethodModal] = useState(null);

  /* fetch once ----------------------------------------------------- */
  useEffect(() => {
    (async () => {
      const [inc, exp] = await Promise.all([API.get('/incomes'),
                                            API.get('/expenses')]);
      setIncomes (inc.data);
      setExpenses(exp.data);
    })();
  }, []);

  /* helpers -------------------------------------------------------- */
  const byTime = rows => rows.filter(r => {
    const dt = parseISO(r.date);
    let ok   = true;
    if      (filter === 'Daily')   ok = isToday(dt);
    else if (filter === 'Weekly')  ok = isThisWeek(dt, { weekStartsOn: 1 });
    else if (filter === 'Monthly') ok = isThisMonth(dt);
    else if (filter === 'Yearly')  ok = isThisYear(dt);
    if (fromDate && toDate)
      ok = dt >= parseISO(fromDate) && dt <= parseISO(toDate);
    return ok;
  });

  /* main-page rows (all methods) */
  const incRows = byTime(incomes);
  const expRows = byTime(expenses);

  const totalIncome  = incRows.reduce((s, i) => s + i.amount, 0);
  const totalExpense = expRows.reduce((s, e) => s + e.amount, 0);
  const savings      = totalIncome - totalExpense;

  /* stats card component ------------------------------------------ */
  const Stat = ({ icon, title, value, color }) => (
    <div className="col">
      <div
        className="card border-0 shadow-sm glass-card h-100 text-center"
        style={{ backdropFilter: 'blur(6px)', background: 'rgba(255,255,255,0.72)' }}
      >
        <div className="card-body py-4">
          <div className={`fs-4 mb-2 text-${color}`}>{icon}</div>
          <h6 className={`fw-semibold text-${color} mb-1`}>{title}</h6>
          <h4 className="fw-bold">
            ₹<CountUp end={value} duration={0.8} decimals={2} />
          </h4>
        </div>
      </div>
    </div>
  );

  /* open modal helper --------------------------------------------- */
  const showMethodModal = m => {
    setMethodModal(m);
    new window.bootstrap.Modal(document.getElementById('methodModal')).show();
  };

  const incRowsM = m => byTime(incomes .filter(r => r.method === m));
  const expRowsM = m => byTime(expenses.filter(r => r.method === m));

  /* -------------------------- UI --------------------------------- */
  return (
    <div
      className="min-vh-100 d-flex flex-column"
      style={{
        background: 'linear-gradient(135deg,#eef2ff 0%, #e0f2fe 40%, #fde68a 100%)',
      }}
    >
      {/* HEADER with dropdown */}
      <div className="container pt-4 d-flex justify-content-end">
        <Dropdown align="end">
          <Dropdown.Toggle
            as="div"
            className="btn p-2 border rounded-circle glass-card"
          >
            <BsThreeDotsVertical size={18} />
          </Dropdown.Toggle>
          <Dropdown.Menu className="shadow">
            <Dropdown.Item onClick={() => showMethodModal('Bank')}>
              <FaUniversity className="me-2" /> {t('bank')}
            </Dropdown.Item>
            <Dropdown.Item onClick={() => showMethodModal('Cash')}>
              <FaMoneyBillWave className="me-2" /> {t('cash')}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      {/* TIME FILTER STRIP */}
      <div className="container mt-4 mb-3">
        <div className="d-flex flex-wrap gap-2 justify-content-center">
          {['All', 'Daily', 'Weekly', 'Monthly', 'Yearly'].map(op => (
            <button
              key={op}
              className={`btn rounded-pill px-3 ${
                filter === op ? 'btn-primary' : 'btn-outline-primary'
              }`}
              onClick={() => {
                setFilter(op);
                setFromDate('');
                setToDate('');
              }}
            >
              {t(op.toLowerCase())}
            </button>
          ))}

          {/* custom range button */}
          <button
            className="btn btn-outline-primary d-flex align-items-center gap-1"
            data-bs-toggle="modal"
            data-bs-target="#dateModal"
            onClick={() => {
              setTmpFrom(today);
              setTmpTo(today);
            }}
          >
            <FaCalendarAlt />
          </button>
        </div>
      </div>

      {/* DONUT (all methods) */}
      <div className="container d-flex justify-content-center flex-wrap mb-5">
        <div style={{ maxWidth: 340, width: '100%' }}>
          <DonutChart totalIncome={totalIncome} totalExpense={totalExpense} />
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="container mb-5">
        <div className="row row-cols-1 row-cols-md-3 g-3">
          <Stat
            icon={<FaArrowUp />}
            title={t('totalIncome')}
            value={totalIncome}
            color="success"
          />
          <Stat
            icon={<FaArrowDown />}
            title={t('totalExpense')}
            value={totalExpense}
            color="danger"
          />
          <Stat
            icon={<FaWallet />}
            title={t('netBalance')}
            value={savings}
            color="primary"
          />
        </div>
      </div>

      {/* DATE RANGE MODAL */}
      <div className="modal fade" id="dateModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div
            className="modal-content border-0 shadow glass-card"
            style={{ backdropFilter: 'blur(8px)' }}
          >
            <div className="modal-header border-0">
              <h5 className="modal-title">
                <FaCalendarAlt className="me-2" />
                {t('customRange')}
              </h5>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <label className="form-label">{t('from')}</label>
              <input
                type="date"
                className="form-control mb-3"
                value={tmpFrom}
                onChange={e => setTmpFrom(e.target.value)}
              />
              <label className="form-label">{t('to')}</label>
              <input
                type="date"
                className="form-control"
                value={tmpTo}
                onChange={e => setTmpTo(e.target.value)}
              />
            </div>
            <div className="modal-footer border-0">
              <button
                className="btn btn-primary"
                data-bs-dismiss="modal"
                onClick={() => {
                  setFromDate(tmpFrom);
                  setToDate(tmpTo);
                  setFilter('Custom');
                }}
              >
                {t('ok')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BANK / CASH MODAL */}
      <div className="modal fade" id="methodModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div
            className="modal-content border-0 shadow glass-card"
            style={{ backdropFilter: 'blur(8px)' }}
          >
            <div className="modal-header border-0">
              <h5 className="modal-title">
                {methodModal} {t('report')}
              </h5>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>

            {methodModal && (() => {
              const incM = incRowsM(methodModal);
              const expM = expRowsM(methodModal);
              const totI = incM.reduce((s, i) => s + i.amount, 0);
              const totE = expM.reduce((s, e) => s + e.amount, 0);
              const sav  = totI - totE;

              return (
                <div className="modal-body">
                  {/* donut */}
                  <div className="d-flex justify-content-center mb-4">
                    <div style={{ maxWidth: 280, width: '100%' }}>
                      <DonutChart totalIncome={totI} totalExpense={totE} />
                    </div>
                  </div>

                  {/* stats */}
                  <div className="row row-cols-1 row-cols-md-3 g-3">
                    <Stat icon={<FaArrowUp />}  title={t('income')}  value={totI} color="success" />
                    <Stat icon={<FaArrowDown />} title={t('expense')} value={totE} color="danger"  />
                    <Stat icon={<FaWallet />}   title={t('savings')} value={sav } color="primary" />
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
