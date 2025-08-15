// src/pages/Transactions.js
import React, { useEffect, useState } from 'react';
import API, { addIncomeCategory, addExpenseCategory } from '../services/api';
import { getPerms } from '../utils/getPerms';
import {parseISO,isToday,isThisWeek,isThisMonth,isThisYear,format,} from 'date-fns';
import { useNavigate } from 'react-router-dom';
import {FaUniversity,FaMoneyBillWave,FaFilter,FaCalendarAlt,} from 'react-icons/fa';
import {BiCalendar,BiCategory,BiNote,BiRupee,} from 'react-icons/bi';
import { BsThreeDotsVertical } from 'react-icons/bs';
import Dropdown from 'react-bootstrap/Dropdown';
import { toast } from 'react-toastify';
import CountUp from 'react-countup';
import { useTranslation } from 'react-i18next';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function Transactions() {
  const { t } = useTranslation();

  /* ---------- data ---------- */
  const [incomes,   setIncomes]   = useState([]);
  const [expenses,  setExpenses]  = useState([]);
  const [incomeCats,  setIncomeCats]  = useState([]);
  const [expenseCats, setExpenseCats] = useState([]);

  /* filters, paging */
  const [filter,    setFilter]    = useState('All');
  const [fromDate,  setFromDate]  = useState('');
  const [toDate,    setToDate]    = useState('');
  const [page,      setPage]      = useState(1);
  const recPerPage = 12;

  const today = new Date().toISOString().slice(0, 10);
  const [tmpFrom, setTmpFrom] = useState(today);
  const [tmpTo,   setTmpTo]   = useState(today);

  /* edit modal */
  const [active, setActive] = useState(null);
  const [form,   setForm]   = useState({
    amount: '',
    category: '',
    note: '',
    date: '',
    method: 'Bank',
  });

  /* add-category modal */
  const [newCat, setNewCat] = useState('');

  /* helpers */
  const perms = getPerms();
  const nav   = useNavigate();

  /* ---------- fetch helpers ---------- */
  const fetchTx = async () => {
    const [inc, exp] = await Promise.all([
      API.get('/incomes'),
      API.get('/expenses'),
    ]);
    setIncomes(inc.data);
    setExpenses(exp.data);
  };

  /* ---------- first load + live refresh ---------- */
  useEffect(() => {
    fetchTx();
    const handler = () => fetchTx();
    window.addEventListener('transactions-updated', handler);
    return () => window.removeEventListener('transactions-updated', handler);
  }, []);

  /* ---------- category lists ---------- */
  useEffect(() => {
    (async () => {
      const [incCat, expCat] = await Promise.all([
        API.get('/user/categories/income'),
        API.get('/user/categories/expense'),
      ]);
      setIncomeCats(incCat.data.categories || incCat.data);
      setExpenseCats(expCat.data.categories || expCat.data);
    })();
  }, []);

  /* ---------- helpers ---------- */
  const applyFilter = (data) =>
    data.filter((r) => {
      const dt = parseISO(r.date);
      let ok = true;
      if (filter === 'Daily')      ok = isToday(dt);
      else if (filter === 'Weekly')  ok = isThisWeek(dt, { weekStartsOn: 1 });
      else if (filter === 'Monthly') ok = isThisMonth(dt);
      else if (filter === 'Yearly')  ok = isThisYear(dt);
      if (fromDate && toDate) ok = dt >= parseISO(fromDate) && dt <= parseISO(toDate);
      return ok;
    });

  const incomeRows  = applyFilter(incomes ).map((i) => ({ ...i, type: 'Income' }));
  const expenseRows = applyFilter(expenses).map((e) => ({ ...e, type: 'Expense' }));
  const rows        = [...incomeRows, ...expenseRows]
                        .sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalPages  = Math.ceil(rows.length / recPerPage);
  const pageData    = rows.slice((page - 1) * recPerPage, page * recPerPage);

  const apiPath = (it) =>
    it.type === 'Income' ? `/incomes/${it._id}` : `/expenses/${it._id}`;

  const openModal = (it) => {
    setActive(it);
    setForm({
      amount:   it.amount,
      category: it.category,
      note:     it.note || '',
      date:     it.date.slice(0, 10),
      method:   it.method,
    });
    new window.bootstrap.Modal(document.getElementById('txModal')).show();
  };

  const saveTx = async () => {
    try {
      await API.put(apiPath(active), {
        ...form,
        amount: parseFloat(form.amount),
      });
      toast.success(t('updated'));
      const upd = (arr) =>
        arr.map((r) =>
          r._id === active._id ? { ...r, ...form, amount: parseFloat(form.amount) } : r
        );
      active.type === 'Income' ? setIncomes(upd) : setExpenses(upd);
    } catch {
      toast.error(t('updateFailed'));
    }
  };

  const deleteTx = async () => {
    if (!window.confirm(t('deleteConfirm'))) return;
    try {
      await API.delete(apiPath(active));
      toast.success(t('deleted'));
      active.type === 'Income'
        ? setIncomes((p) => p.filter((r) => r._id !== active._id))
        : setExpenses((p) => p.filter((r) => r._id !== active._id));
    } catch {
      toast.error(t('deleteFailed'));
    }
  };

  const saveNewCat = async () => {
    if (!newCat.trim()) return;
    try {
      if (active?.type === 'Income') {
        const { data } = await addIncomeCategory({ category: newCat.trim() });
        setIncomeCats(data.categories || data);
      } else {
        const { data } = await addExpenseCategory({ category: newCat.trim() });
        setExpenseCats(data.categories || data);
      }
      setForm({ ...form, category: newCat.trim() });
      toast.success(t('categoryAdded'));
    } catch {
      toast.error(t('categoryAddFailed'));
    }
    setNewCat('');
  };

  return (
    <div
      className="min-vh-100 d-flex flex-column"
      style={{
        background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe, #fde68a)',
      }}
    >
      {/* ---------- NAV ROW ---------- */}
      <div className="container pt-4 d-flex justify-content-end">
        <Dropdown align="end">
          <Dropdown.Toggle
            as="div"
            className="btn p-2 border rounded-circle glass-card"
          >
            <BsThreeDotsVertical size={18} />
          </Dropdown.Toggle>
          <Dropdown.Menu className="shadow">
            <Dropdown.Item onClick={() => nav('/transactions/bank')}>
              <FaUniversity className="me-2" /> {t('bank')}
            </Dropdown.Item>
            <Dropdown.Item onClick={() => nav('/transactions/cash')}>
              <FaMoneyBillWave className="me-2" /> {t('cash')}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      {/* ---------- FILTER STRIP ---------- */}
      <div className="container mt-4 mb-3">
        <div className="d-flex flex-wrap gap-2 justify-content-center">
          {['All', 'Daily', 'Weekly', 'Monthly', 'Yearly'].map((op) => (
            <button
              key={op}
              className={`btn rounded-pill px-3 ${
                filter === op ? 'btn-primary' : 'btn-outline-primary'
              }`}
              onClick={() => {
                setFilter(op);
                setFromDate('');
                setToDate('');
                setTmpFrom(today);
                setTmpTo(today);
              }}
            >
              {t(op.toLowerCase())}
            </button>
          ))}
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

      {/* ---------- TABLE CARD ---------- */}
      <div className="container mb-5 flex-grow-1">
        <div
          className="card border-0 shadow-lg glass-card"
          style={{
            backdropFilter: 'blur(8px)',
            background: 'rgba(255,255,255,0.7)',
          }}
        >
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light sticky-top">
                <tr>
                  <th>{t('date')}</th>
                  <th>{t('category')}</th>
                  <th>{t('type')}</th>
                  <th className="text-end">
                    {t('amount')} (₹)
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageData.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-muted">
                      {t('noTransactions')}
                    </td>
                  </tr>
                ) : (
                  pageData.map((it) => (
                    <tr
                      key={it._id}
                      className={
                        it.type === 'Income'
                          ? 'table-success table-borderless'
                          : 'table-danger table-borderless'
                      }
                      style={{ cursor: 'pointer' }}
                      onClick={() => openModal(it)}
                    >
                      <td>
                        {format(parseISO(it.date), 'yyyy-MM-dd')}
                        <br />
                        <small className="text-muted">
                          {t(it.method)} | {it.note || t('noNote')}
                        </small>
                      </td>
                      <td>{it.category}</td>
                      <td>{t(it.type.toLowerCase())}</td>
                      <td className="text-end fw-bold">
                        <CountUp end={it.amount} duration={0.4} prefix="₹" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINATION */}
        <div className="d-flex justify-content-center gap-2 mt-3 flex-wrap">
          <button
            className="btn btn-outline-primary"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            {t('prev')}
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={`btn ${
                page === i + 1 ? 'btn-primary' : 'btn-outline-primary'
              }`}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="btn btn-outline-primary"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            {t('next')}
          </button>
        </div>
      </div>

      {/* ---------- EDIT / DELETE MODAL ---------- */}
      <div className="modal fade" id="txModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div
            className="modal-content p-4 border-0 shadow glass-card"
            style={{ backdropFilter: 'blur(8px)' }}
          >
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">
                {active?.type === 'Income'
                  ? t('editIncome')
                  : t('editExpense')}
              </h5>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>

            {/* Method toggle */}
            <div className="d-flex justify-content-center gap-2 mb-4">
              {['Bank', 'Cash'].map((m) => (
                <button
                  key={m}
                  className={`btn ${
                    form.method === m ? 'btn-primary' : 'btn-outline-primary'
                  }`}
                  onClick={() => setForm({ ...form, method: m })}
                >
                  {m === 'Bank' ? '🏦' : '💵'} {t(m.toLowerCase())}
                </button>
              ))}
            </div>

            {/* Form fields */}
            <div className="row g-3">
              {/* Date */}
              <div className="col-md-6">
                <label className="form-label">{t('date')}</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <BiCalendar />
                  </span>
                  <input
                    type="date"
                    className="form-control"
                    value={form.date}
                    onChange={(e) =>
                      setForm({ ...form, date: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Category */}
              <div className="col-md-6">
                <label className="form-label">{t('category')}</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <BiCategory />
                  </span>
                  <select
                    className="form-select"
                    value={form.category}
                    onChange={(e) => {
                      if (e.target.value === '__add_new__') {
                        new window.bootstrap.Modal(
                          document.getElementById('catModal')
                        ).show();
                      } else {
                        setForm({ ...form, category: e.target.value });
                      }
                    }}
                  >
                    {(active?.type === 'Income'
                      ? incomeCats
                      : expenseCats
                    ).map((c, i) => (
                      <option key={i} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="__add_new__">
                      ➕ {t('addNewCategory')}
                    </option>
                  </select>
                </div>
              </div>

              {/* Amount */}
              <div className="col-md-6">
                <label className="form-label">{t('amount')}</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <BiRupee />
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="form-control"
                    placeholder={t('amount')}
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Note */}
              <div className="col-md-6">
                <label className="form-label">{t('note')}</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <BiNote />
                  </span>
                  <input
                    className="form-control"
                    placeholder={t('noteOptional')}
                    value={form.note}
                    onChange={(e) =>
                      setForm({ ...form, note: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="d-flex justify-content-between align-items-center mt-4">
              {perms.canDelete && (
                <button
                  className="btn btn-outline-danger"
                  onClick={deleteTx}
                  data-bs-dismiss="modal"
                >
                  {t('delete')}
                </button>
              )}
              <div className="ms-auto d-flex gap-2">
                <button
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  {t('cancel')}
                </button>
                {perms.canEdit && (
                  <button
                    className="btn btn-primary"
                    onClick={saveTx}
                    data-bs-dismiss="modal"
                  >
                    {t('save')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- ADD CATEGORY MODAL ---------- */}
      <div className="modal fade" id="catModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div
            className="modal-content border-0 shadow glass-card"
            style={{ backdropFilter: 'blur(8px)' }}
          >
            <div className="modal-header border-0">
              <h5 className="modal-title">{t('addCategory')}</h5>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <input
                className="form-control"
                placeholder={t('categoryName')}
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
              />
            </div>
            <div className="modal-footer border-0">
              <button
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                {t('cancel')}
              </button>
              <button
                className="btn btn-primary"
                data-bs-dismiss="modal"
                onClick={saveNewCat}
              >
                {t('add')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- DATE RANGE MODAL ---------- */}
      <div className="modal fade" id="dateModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div
            className="modal-content border-0 shadow glass-card"
            style={{ backdropFilter: 'blur(8px)' }}
          >
            <div className="modal-header border-0">
              <h5 className="modal-title">
                <FaFilter className="me-2" />
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
                onChange={(e) => setTmpFrom(e.target.value)}
              />
              <label className="form-label">{t('to')}</label>
              <input
                type="date"
                className="form-control"
                value={tmpTo}
                onChange={(e) => setTmpTo(e.target.value)}
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
    </div>
  );
}
