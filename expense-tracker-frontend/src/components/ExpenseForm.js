import React, { useEffect, useState } from 'react';
import API, { addExpenseCategory } from '../services/api';
import { toast } from 'react-toastify';
import { BiRupee, BiCalendar, BiCategory, BiNote } from 'react-icons/bi';
import { useTranslation } from 'react-i18next';

function ExpenseForm({ onAdd, disabled = false }) {
  const { t } = useTranslation();

  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getToday = () => {
    const today = new Date();
    return today.toLocaleDateString('en-CA'); // 'YYYY-MM-DD'
  };

  const [form, setForm] = useState({
    amount: '',
    category: '',
    note: '',
    method: 'Bank',
    date: getToday(),
  });

  useEffect(() => {
    const cached = JSON.parse(localStorage.getItem('expenseCategories') || '[]');
    if (cached.length) setCategories(cached);
    (async () => {
      try {
        const { data } = await API.get('/user/categories/expense');
        const list = data.categories || data;
        setCategories(list);
        localStorage.setItem('expenseCategories', JSON.stringify(list));
        if (list.length) setForm(p => ({ ...p, category: list[0] }));
      } catch {
        toast.error(t('fetchExpenseCategoriesError'));
      }
    })();
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await API.post('/expenses/add', { ...form, amount: parseFloat(form.amount) });
      onAdd();
      window.dispatchEvent(new Event('transactions-updated'));
      setForm({
        amount: '',
        category: categories[0] || '',
        note: '',
        method: 'Bank',
        date: getToday(),
      });
      toast.success(t('expenseAdded'));
    } catch {
      toast.error(t('addExpenseError'));
    }
    setIsSubmitting(false);
  };

  const handleCategoryChange = e => {
    const selected = e.target.value;
    if (selected === '__add_new__') {
      new window.bootstrap.Modal(document.getElementById('addExpenseCategoryModal')).show();
    } else setForm({ ...form, category: selected });
  };

  const handleAddCategory = async () => {
    if (newCategory && !categories.includes(newCategory)) {
      try {
        const { data } = await addExpenseCategory({ category: newCategory });
        const list = data.categories || data;
        setCategories(list);
        localStorage.setItem('expenseCategories', JSON.stringify(list));
        setForm({ ...form, category: newCategory });
        toast.success(t('categoryAdded'));
      } catch {
        toast.error(t('saveCategoryError'));
      }
    }
    setNewCategory('');
  };

  if (disabled) return <p className="text-danger text-center">{t('noPermissionToAddExpense')}</p>;

  return (
    <>
      <form onSubmit={handleSubmit} className="shadow p-4 rounded bg-white mb-4">
        <h5 className="text-danger mb-3">{t('addNewExpense')}</h5>

        <div className="d-flex justify-content-center mb-3 gap-2">
          <button
            type="button"
            className={`btn ${form.method === 'Bank' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setForm({ ...form, method: 'Bank' })}
          >🏦 {t('bank')}</button>
          <button
            type="button"
            className={`btn ${form.method === 'Cash' ? 'btn-success' : 'btn-outline-success'}`}
            onClick={() => setForm({ ...form, method: 'Cash' })}
          >💵 {t('cash')}</button>
        </div>

        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">{t('date')}</label>
            <div className="input-group">
              <span className="input-group-text"><BiCalendar /></span>
              <input
                type="date"
                className="form-control"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
              />
            </div>
          </div>

          <div className="col-md-6">
            <label className="form-label">{t('category')}</label>
            <div className="input-group">
              <span className="input-group-text"><BiCategory /></span>
              <select
                className="form-select"
                value={form.category}
                required
                onChange={handleCategoryChange}
              >
                {categories.map((cat, idx) => <option key={idx} value={cat}>{cat}</option>)}
                <option value="__add_new__">➕ {t('addNewCategory')}</option>
              </select>
            </div>
          </div>

          <div className="col-md-6">
            <label className="form-label">{t('amount')}</label>
            <div className="input-group">
              <span className="input-group-text"><BiRupee /></span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                className="form-control"
                placeholder={t('enterAmount')}
                required
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
              />
            </div>
          </div>

          <div className="col-md-6">
            <label className="form-label">{t('note')}</label>
            <div className="input-group">
              <span className="input-group-text"><BiNote /></span>
              <input
                className="form-control"
                placeholder={t('optionalNote')}
                value={form.note}
                onChange={e => setForm({ ...form, note: e.target.value })}
              />
            </div>
          </div>

          <div className="col-12 d-grid mt-3">
            <button type="submit" className="btn btn-danger rounded-pill" disabled={isSubmitting}>
              {isSubmitting ? t('adding') : `➕ ${t('addExpense')}`}
            </button>
          </div>
        </div>
      </form>

      {/* Category Modal */}
      <div className="modal fade" id="addExpenseCategoryModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content p-3">
            <div className="modal-header">
              <h5 className="modal-title">{t('addNewCategory')}</h5>
              <button className="btn-close" data-bs-dismiss="modal" />
            </div>
            <div className="modal-body">
              <input
                className="form-control mb-3"
                placeholder={t('newCategory')}
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
              />
              <div className="d-flex justify-content-end gap-2">
                <button className="btn btn-secondary" data-bs-dismiss="modal">{t('cancel')}</button>
                <button className="btn btn-primary" data-bs-dismiss="modal" onClick={handleAddCategory}>
                  {t('add')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ExpenseForm;
