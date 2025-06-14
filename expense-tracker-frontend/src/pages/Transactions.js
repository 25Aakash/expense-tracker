import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { parseISO, isToday, isThisWeek, isThisMonth, isThisYear, format } from 'date-fns';
import { FaUniversity, FaMoneyBillWave, FaUndo } from 'react-icons/fa';

function Transactions() {
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [filter, setFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const recordsPerPage = 10;

  const today = new Date().toISOString().split('T')[0];
  const [tempFromDate, setTempFromDate] = useState(today);
  const [tempToDate, setTempToDate] = useState(today);

  useEffect(() => {
    const fetchData = async () => {
      const [incRes, expRes] = await Promise.all([
        API.get('/incomes'),
        API.get('/expenses')
      ]);
      setIncomes(incRes.data);
      setExpenses(expRes.data);
    };
    fetchData();
  }, []);

  const applyFilter = (data) => {
    return data.filter(entry => {
      const date = parseISO(entry.date);
      let pass = true;

      // Time-based filter
      if (filter === 'Daily') pass = isToday(date);
      else if (filter === 'Weekly') pass = isThisWeek(date, { weekStartsOn: 1 });
      else if (filter === 'Monthly') pass = isThisMonth(date);
      else if (filter === 'Yearly') pass = isThisYear(date);

      // Payment method filter
      if (paymentFilter && entry.method !== paymentFilter) return false;

      // Date range filter
      if (fromDate && toDate) {
        pass = date >= parseISO(fromDate) && date <= parseISO(toDate);
      }

      return pass;
    });
  };

  const filteredIncome = applyFilter(incomes).map(i => ({ ...i, type: 'Income' }));
  const filteredExpense = applyFilter(expenses).map(e => ({ ...e, type: 'Expense' }));
  const combined = [...filteredIncome, ...filteredExpense].sort((a, b) => new Date(b.date) - new Date(a.date));
  const totalPages = Math.ceil(combined.length / recordsPerPage);
  const paginated = combined.slice((page - 1) * recordsPerPage, page * recordsPerPage);

  return (
    <div className="container py-4">

      {/* Filter Buttons */}
      <div className="d-flex justify-content-center mb-3 gap-2 flex-wrap">
        {['All', 'Daily', 'Weekly', 'Monthly', 'Yearly'].map(option => (
          <button
            key={option}
            className={`btn rounded-pill ${filter === option ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => {
              setFilter(option);
              setFromDate('');
              setToDate('');
              setTempFromDate(today);
              setTempToDate(today);
            }}
          >
            {option}
          </button>
        ))}
        <button
          className="btn btn-outline-primary"
          data-bs-toggle="modal"
          data-bs-target="#dateModal"
          onClick={() => {
            setTempFromDate(today);
            setTempToDate(today);
          }}
        >
          📅
        </button>
      </div>

      {/* Payment Filter */}
      <div className="text-center mb-4">
        <div className="d-flex justify-content-center gap-2 flex-wrap">
          <button className={`btn ${paymentFilter === 'Bank' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setPaymentFilter('Bank')}>
            <FaUniversity className="me-1" /> Bank
          </button>
          <button className={`btn ${paymentFilter === 'Cash' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setPaymentFilter('Cash')}>
            <FaMoneyBillWave className="me-1" /> Cash
          </button>
          <button className="btn btn-outline-secondary" onClick={() => setPaymentFilter('')}>
            <FaUndo className="me-1" /> Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive" style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'inline-block' }}>
          <table className="table table-hover shadow-sm" style={{ width: 'auto', tableLayout: 'auto' }}>
            <thead className="table-light">
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Type</th>
                <th className="text-end">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan="4" className="text-center text-muted">No transactions found.</td></tr>
              ) : (
                paginated.map((item, idx) => (
                  <tr key={idx} className={item.type === 'Income' ? 'table-success' : 'table-danger'}>
                    <td>{format(parseISO(item.date), 'yyyy-MM-dd')}<br /><small className="text-muted">{item.method}</small></td>
                    <td>{item.category}</td>
                    <td>{item.type}</td>
                    <td className="text-end fw-bold">₹{item.amount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-center mt-3 gap-2 flex-wrap">
        <button className="btn btn-outline-primary" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
        {[...Array(totalPages)].map((_, i) => (
          <button key={i} className={`btn ${page === i + 1 ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setPage(i + 1)}>
            {i + 1}
          </button>
        ))}
        <button className="btn btn-outline-primary" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button>
      </div>

      {/* Date Range Modal */}
      <div className="modal fade" id="dateModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Select Date Range</h5>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <label>From:</label>
              <input type="date" className="form-control mb-3" value={tempFromDate} onChange={e => setTempFromDate(e.target.value)} />
              <label>To:</label>
              <input type="date" className="form-control" value={tempToDate} onChange={e => setTempToDate(e.target.value)} />
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-primary"
                data-bs-dismiss="modal"
                onClick={() => {
                  setFromDate(tempFromDate || today);
                  setToDate(tempToDate || today);
                  setFilter('Custom');
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Transactions;
