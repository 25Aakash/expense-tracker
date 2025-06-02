import React, { useEffect, useState } from 'react';
import API from '../services/api';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import ExpenseChart from '../charts/ExpenseChart';
import ExpenseTrendChart from '../charts/ExpenseTrendChart'; // NEW
import ExportButtons from '../components/ExportButtons';


function Dashboard() {
  const [expenses, setExpenses] = useState([]);

  const fetchExpenses = async () => {
    try {
      const res = await API.get('/expenses');
      setExpenses(res.data);
    } catch (err) {
      alert('Failed to fetch expenses');
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return (
    <div className="container py-4">
      <div className="text-center mb-4">
        <h2 className="text-primary">Cashbook</h2>
        <p className="text-muted">Track your daily expenses and view insights</p>
      </div>

      {/* Add Expense */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title">Add New Expense</h5>
          <ExpenseForm onAdd={fetchExpenses} />
        </div>
      </div>

      {/* Charts Row */}
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <ExpenseTrendChart expenses={expenses} type="line" />
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <ExpenseChart expenses={expenses} />
            </div>
          </div>
        </div>
      </div>

      {/* Expense List */}
      <div className="card shadow-sm mb-5">
        <div className="card-body">
          {/* Export CSV */}
          <ExportButtons expenses={expenses} />
          <ExpenseList expenses={expenses} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
