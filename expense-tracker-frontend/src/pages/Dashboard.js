import React, { useEffect, useState, useCallback } from 'react';
import API from '../services/api';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseChart from '../charts/ExpenseChart';
import IncomeForm from '../components/IncomeForm';
import ExpenseTrendChart from '../charts/ExpenseTrendChart';

function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [filteredIncomes, setFilteredIncomes] = useState([]);
  const [filters, setFilters] = useState({ category: '', startDate: '', endDate: '' });
  const [showForm, setShowForm] = useState('income');

  const fetchExpenses = async () => {
    const res = await API.get('/expenses');
    setExpenses(res.data);
  };

  const fetchIncomes = async () => {
    const res = await API.get('/incomes');
    setIncomes(res.data);
  };

  const applyFilters = useCallback(() => {
    let exp = [...expenses];
    let inc = [...incomes];

    if (filters.category) {
      exp = exp.filter(e => e.category === filters.category);
      inc = inc.filter(i => i.category === filters.category);
    }
    if (filters.startDate) {
      exp = exp.filter(e => new Date(e.date) >= new Date(filters.startDate));
      inc = inc.filter(i => new Date(i.date) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      exp = exp.filter(e => new Date(e.date) <= new Date(filters.endDate));
      inc = inc.filter(i => new Date(i.date) <= new Date(filters.endDate));
    }

    setFilteredExpenses(exp);
    setFilteredIncomes(inc);
  }, [expenses, incomes, filters]);

  useEffect(() => {
    fetchExpenses();
    fetchIncomes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [expenses, incomes, filters, applyFilters]);

  const totalIncome = filteredIncomes.reduce((acc, income) => acc + income.amount, 0);
  const totalExpense = filteredExpenses.reduce((acc, expense) => acc + expense.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4 text-primary">Dashboard</h2>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-12 col-md-4 mb-3">
          <div className="card text-center bg-light h-100 shadow-sm">
            <div className="card-body">
              <h6 className="text-success mb-2">Total Income</h6>
              <h4>₹{totalIncome.toFixed(2)}</h4>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4 mb-3">
          <div className="card text-center bg-light h-100 shadow-sm">
            <div className="card-body">
              <h6 className="text-danger mb-2">Total Expenses</h6>
              <h4>₹{totalExpense.toFixed(2)}</h4>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4 mb-3">
          <div className="card text-center bg-light h-100 shadow-sm">
            <div className="card-body">
              <h6 className="text-primary mb-2">Net Balance</h6>
              <h4>₹{balance.toFixed(2)}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Add Buttons */}
      <div className="text-center mb-4">
        <button
          className="btn btn-success me-2 px-4"
          data-bs-toggle="modal"
          data-bs-target="#addTransactionModal"
          onClick={() => setShowForm('income')}
        >
          Add Income
        </button>

        <button
          className="btn btn-danger px-4"
          data-bs-toggle="modal"
          data-bs-target="#addTransactionModal"
          onClick={() => setShowForm('expense')}
        >
          Add Expense
        </button>
      </div>

      {/* Charts */}
      <div className="row">
        <div className="col-12 col-md-6 mb-4">
          <ExpenseTrendChart expenses={filteredExpenses} />
        </div>
        <div className="col-12 col-md-6 mb-4">
          <ExpenseChart expenses={filteredExpenses} />
        </div>
      </div>

      {/* Modal */}
      <div className="modal fade" id="addTransactionModal" tabIndex="-1" aria-labelledby="addTransactionModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add Transaction</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div className="d-flex justify-content-center gap-3 my-3">
              <button className={`btn ${showForm === 'income' ? 'btn-success' : 'btn-outline-success'}`} onClick={() => setShowForm('income')}>Income</button>
              <button className={`btn ${showForm === 'expense' ? 'btn-danger' : 'btn-outline-danger'}`} onClick={() => setShowForm('expense')}>Expense</button>
            </div>

            <div className="modal-body">
              {showForm === 'income' ? (
                <IncomeForm onAdd={fetchIncomes} />
              ) : (
                <ExpenseForm onAdd={fetchExpenses} />
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Dashboard;
