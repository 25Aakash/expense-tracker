// src/pages/Categories.js
import React, { useEffect, useRef, useState } from 'react';
import API from '../services/api';
import { parseISO, format } from 'date-fns';
import CountUp from 'react-countup';
import { BiCategory } from 'react-icons/bi';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

export default function Categories() {
  const { t } = useTranslation();

  const [incCats, setIncCats] = useState([]);
  const [expCats, setExpCats] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [active, setActive] = useState(null);

  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const cardsPerBatch = isMobile ? 4 : 8;
  const [showInc, setShowInc] = useState(cardsPerBatch);
  const [showExp, setShowExp] = useState(cardsPerBatch);

  const modalRef = useRef(null);
  const bsModal = useRef(null);

  useEffect(() => {
    (async () => {
      const [{ data: ic }, { data: ec }, { data: inc }, { data: exp }] = await Promise.all([
        API.get('/user/categories/income'),
        API.get('/user/categories/expense'),
        API.get('/incomes'),
        API.get('/expenses')
      ]);
      setIncCats(ic.categories || ic);
      setExpCats(ec.categories || ec);
      setIncomes(inc);
      setExpenses(exp);
    })();
  }, []);

  useEffect(() => {
    const handler = () => {
      const m = window.innerWidth < 768;
      setIsMobile(m);
      const batch = m ? 4 : 8;
      setShowInc(batch);
      setShowExp(batch);
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  useEffect(() => {
    if (!modalRef.current || !window.bootstrap) return;
    bsModal.current = new window.bootstrap.Modal(modalRef.current, { backdrop: true });
  }, []);

  useEffect(() => {
    if (!bsModal.current) return;
    active ? bsModal.current.show() : bsModal.current.hide();
  }, [active]);

  const rowsByCat = (name, type) =>
    (type === 'Income' ? incomes : expenses).filter(tx => tx.category === name);

  const CatCard = ({ name, type }) => {
    const count = rowsByCat(name, type).length;
    const color = type === 'Income' ? 'success' : 'danger';
    return (
      <div className="col">
        <div
          className="card border-0 shadow-sm glass-card h-100 bg-white"
          style={{ cursor: 'pointer', backdropFilter: 'blur(6px)' }}
          onClick={() => setActive({ name, type })}
        >
          <div className="card-body text-center">
            <BiCategory className={`fs-2 text-${color} mb-3`} />
            <h6 className="fw-bold">{name}</h6>
            <span className={`badge bg-${color}`}>{count} {t('transactions')}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-vh-100 d-flex flex-column"
         style={{ background: 'linear-gradient(135deg,#eef2ff 0%,#e0f2fe 40%,#fde68a 100%)' }}>
      <div className="container my-4 flex-grow-1">
        {incCats.length > 0 && (
          <>
            <h6 className="text-success fw-semibold mb-3">
              <FaArrowUp className="me-1" /> {t('incomeCategories')}
            </h6>
            <div className="row row-cols-2 row-cols-md-4 g-3 mb-3">
              {incCats.slice(0, showInc).map(c => (
                <CatCard key={c} name={c} type="Income" />
              ))}
            </div>
            {showInc < incCats.length && (
              <div className="d-flex justify-content-center mb-4">
                <button
                  className="btn btn-outline-primary"
                  onClick={() => setShowInc(s => s + cardsPerBatch)}
                >
                  {t('loadMore')}
                </button>
              </div>
            )}
          </>
        )}

        {expCats.length > 0 && (
          <>
            <h6 className="text-danger fw-semibold mb-3 mt-4">
              <FaArrowDown className="me-1" /> {t('expenseCategories')}
            </h6>
            <div className="row row-cols-2 row-cols-md-4 g-3 mb-3">
              {expCats.slice(0, showExp).map(c => (
                <CatCard key={c} name={c} type="Expense" />
              ))}
            </div>
            {showExp < expCats.length && (
              <div className="d-flex justify-content-center">
                <button
                  className="btn btn-outline-primary"
                  onClick={() => setShowExp(s => s + cardsPerBatch)}
                >
                  {t('loadMore')}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="modal fade" id="catTxModal" tabIndex="-1" ref={modalRef}>
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content border-0 shadow glass-card" style={{ backdropFilter: 'blur(8px)' }}>
            <div className="modal-header border-0">
              <h5 className="modal-title">
                {active?.type === 'Income' ? t('income') : t('expense')} – {active?.name}
              </h5>
              <button className="btn-close" onClick={() => setActive(null)}></button>
            </div>
            <div className="modal-body p-0">
              {active && (
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>{t('date')}</th>
                        <th>{t('note')}</th>
                        <th className="text-end">{t('amount')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rowsByCat(active.name, active.type).map(tx => (
                        <tr key={tx._id}
                            className={active.type === 'Income' ? 'table-success' : 'table-danger'}>
                          <td>{format(parseISO(tx.date), 'yyyy-MM-dd')}<br /><small className='text-muted'>{t(tx.method)}</small></td>
                          <td>{tx.note || t('noNote')}</td>
                          <td className="text-end fw-bold">
                            <CountUp end={tx.amount} duration={0.4} prefix="₹" />
                          </td>
                        </tr>
                      ))}
                      {rowsByCat(active.name, active.type).length === 0 && (
                        <tr>
                          <td colSpan="3" className="text-center py-4 text-muted">
                            {t('noTransactions')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
