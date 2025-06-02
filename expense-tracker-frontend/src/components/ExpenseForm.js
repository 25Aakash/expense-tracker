import React, { useState } from 'react';
import API from '../services/api';

function ExpenseForm({ onAdd }) {
  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: '',
    note: '',
    date: new Date().toISOString().slice(0, 10), // ✅ today's date by default
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/expenses/add', form);
      onAdd(); // refresh the expense list
      setForm({
        title: '',
        amount: '',
        category: '',
        note: '',
        date: new Date().toISOString().slice(0, 10), // reset to today
      });
    } catch (err) {
      alert('Failed to add expense');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="row g-3">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div className="col-md-6">
          <input
            type="number"
            className="form-control"
            placeholder="Amount"
            required
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
        </div>
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Category"
            required
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
        </div>
        <div className="col-md-6">
          <input
            type="date"
            className="form-control"
            required
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </div>
        <div className="col-12">
          <textarea
            className="form-control"
            placeholder="Note (optional)"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
          ></textarea>
        </div>
        <div className="col-12 d-grid">
          <button type="submit" className="btn btn-primary">Add Expense</button>
        </div>
      </div>
    </form>
  );
}

export default ExpenseForm;
