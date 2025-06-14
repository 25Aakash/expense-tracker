import React, { useEffect, useState } from 'react';
import API from '../services/api';
import DonutChart from '../charts/DonutChart';
import { parseISO, isToday, isThisWeek, isThisMonth, isThisYear } from 'date-fns';

function Reports() {
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [filter, setFilter] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Default to today
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

      if (filter === 'Daily') pass = isToday(date);
      else if (filter === 'Weekly') pass = isThisWeek(date, { weekStartsOn: 1 });
      else if (filter === 'Monthly') pass = isThisMonth(date);
      else if (filter === 'Yearly') pass = isThisYear(date);

      if (fromDate && toDate) {
        pass = date >= parseISO(fromDate) && date <= parseISO(toDate);
      }

      return pass;
    });
  };

  const filteredIncome = applyFilter(incomes);
  const filteredExpense = applyFilter(expenses);
  const totalIncome = filteredIncome.reduce((sum, i) => sum + i.amount, 0);
  const totalExpense = filteredExpense.reduce((sum, e) => sum + e.amount, 0);
  const savings = totalIncome - totalExpense;

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

        {/* Date Range Picker */}
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

      {/* Donut Chart */}
      <div className="d-flex justify-content-center mb-4 flex-wrap">
        <div style={{ maxWidth: '320px', width: '100%' }}>
          <DonutChart totalIncome={totalIncome} totalExpense={totalExpense} />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row text-center fw-bold mb-4">
        <div className="col-12 col-md-4 mb-3">
          <div className="card bg-light shadow-sm py-3">
            <h6 className="text-success mb-1">Total Income</h6>
            <h5>₹{totalIncome}</h5>
          </div>
        </div>
        <div className="col-12 col-md-4 mb-3">
          <div className="card bg-light shadow-sm py-3">
            <h6 className="text-danger mb-1">Total Expense</h6>
            <h5>₹{totalExpense}</h5>
          </div>
        </div>
        <div className="col-12 col-md-4 mb-3">
          <div className="card bg-light shadow-sm py-3">
            <h6 className="text-primary mb-1">Savings</h6>
            <h5>₹{savings}</h5>
          </div>
        </div>
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

export default Reports;
