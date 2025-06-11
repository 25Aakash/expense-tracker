import React, { useState } from 'react';
import API from '../services/api';
import { Modal } from 'bootstrap';

function IncomeForm({ onAdd }) {
  const defaultCategories = ['Salary', 'Business', 'Interest', 'Gifts', 'Other'];
  const [categories, setCategories] = useState(defaultCategories);

  const [form, setForm] = useState({
    amount: '',
    category: defaultCategories[0],
    note: '',
    method: 'Bank',
    date: new Date().toISOString().slice(0, 10),
  });

  const [newCategory, setNewCategory] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/incomes/add', form);
      onAdd();
      setForm({
        amount: '',
        category: defaultCategories[0],
        note: '',
        method: 'Bank',
        date: new Date().toISOString().slice(0, 10),
      });
    } catch (err) {
      alert('Failed to add income');
    }
  };

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      const updated = [...categories, newCategory];
      setCategories(updated);
      setForm({ ...form, category: newCategory });
    }
    setNewCategory('');
  };

  const handleCategoryChange = (e) => {
    const selected = e.target.value;
    if (selected === '__add_new__') {
      const modalEl = document.getElementById('addIncomeCategoryModal');
      const modal = new Modal(modalEl);
      modal.show();
    } else {
      setForm({ ...form, category: selected });
    }
  };
  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
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
            <select
              className="form-select"
              value={form.category}
              required
              onChange={handleCategoryChange}
            >
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
              <option value="__add_new__">➕ Add New Category</option>
            </select>
          </div>

          <div className="col-md-6">
            <select
              className="form-select"
              value={form.method}
              required
              onChange={(e) => setForm({ ...form, method: e.target.value })}
            >
              <option value="Bank">Bank</option>
              <option value="Cash">Cash</option>
            </select>
          </div>

          <div className="col-md-6">
            <input
              type="date"
              className="form-control"
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
            <button type="submit" className="btn btn-success rounded-pill">
              Add Income
            </button>
          </div>
        </div>
      </form>

      {/* Hidden trigger button for modal */}
      <button type="button" id="addIncomeCategoryModalBtn" data-bs-toggle="modal" data-bs-target="#addIncomeCategoryModal" hidden/>

      {/* Modal for Adding New Category */}
      <div className="modal fade" id="addIncomeCategoryModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content p-3">
            <h5 className="mb-3 fw-bold text-primary">Add New Category</h5>
            <input
              type="text"
              className="form-control mb-3"
              placeholder="New Category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button className="btn btn-primary" data-bs-dismiss="modal" onClick={handleAddCategory}>Add</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default IncomeForm;
