import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { parseISO, format } from 'date-fns';
import { toast } from 'react-toastify';
import { getPerms } from '../utils/getPerms';
import { useTranslation } from 'react-i18next';

function TransactionList({ method }) {
  const { t } = useTranslation();
  const perms = getPerms();
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    amount: '',
    category: '',
    note: '',
    date: ''
  });

  useEffect(() => {
    (async () => {
      const [incRes, expRes] = await Promise.all([
        API.get('/incomes'),
        API.get('/expenses')
      ]);
      setIncomes(incRes.data);
      setExpenses(expRes.data);
    })();
  }, []);

  const unified = [
    ...incomes.map(i => ({ ...i, type: t('income') })),
    ...expenses.map(e => ({ ...e, type: t('expense') }))
  ].filter(r => r.method === method)
   .sort((a, b) => new Date(b.date) - new Date(a.date));

  const apiPath = item => (item.type === t('income') ? `/incomes/${item._id}` : `/expenses/${item._id}`);
  const apiDelete = item => API.delete(apiPath(item));
  const apiUpdate = (item, body) => API.put(apiPath(item), body);

  const handleDelete = async item => {
    if (!window.confirm(t('deleteConfirm'))) return;
    try {
      await apiDelete(item);
      toast.success(t('deleted'));
      if (item.type === t('income')) setIncomes(p => p.filter(i => i._id !== item._id));
      else setExpenses(p => p.filter(e => e._id !== item._id));
    } catch {
      toast.error(t('deleteFailed'));
    }
  };

  const openEdit = item => {
    setEditing(item);
    setForm({
      amount: item.amount,
      category: item.category,
      note: item.note || '',
      date: item.date.slice(0, 10)
    });
    if (window?.bootstrap?.Modal) new window.bootstrap.Modal(document.getElementById('editModal')).show();
  };

  const saveEdit = async () => {
    try {
      await apiUpdate(editing, { ...form, amount: parseFloat(form.amount) });
      toast.success(t('updated'));
      const updater = arr => arr.map(r => (r._id === editing._id ? { ...r, ...form, amount: parseFloat(form.amount) } : r));
      if (editing.type === t('income')) setIncomes(updater);
      else setExpenses(updater);
    } catch {
      toast.error(t('updateFailed'));
    }
    setEditing(null);
  };

  return (
    <>
      <div className="table-responsive">
        <table className="table table-hover shadow-sm">
          <thead className="table-light">
            <tr>
              <th>{t("date")}</th>
              <th>{t("category")}</th>
              <th>{t("type")}</th>
              <th className="text-end">{t("amount")} (₹)</th>
              {(perms.canEdit || perms.canDelete) && <th className="text-end">{t("actions")}</th>}
            </tr>
          </thead>
          <tbody>
            {unified.length === 0 ? (
              <tr><td colSpan="5" className="text-center text-muted">{t("noTransactionsFound", { method })}</td></tr>
            ) : (
              unified.map((it, idx) => (
                <tr key={idx} className={it.type === t('income') ? 'table-success' : 'table-danger'}>
                  <td>{format(parseISO(it.date), 'yyyy-MM-dd')}</td>
                  <td>{it.category}</td>
                  <td>{it.type}</td>
                  <td className="text-end fw-bold">₹{it.amount}</td>
                  {(perms.canEdit || perms.canDelete) && (
                    <td className="text-end">
                      {perms.canEdit && (
                        <button className="btn btn-sm btn-warning me-1" onClick={() => openEdit(it)}>{t("edit")}</button>
                      )}
                      {perms.canDelete && (
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(it)}>{t("delete")}</button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      <div className="modal fade" id="editModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content p-3">
            <div className="modal-header">
              <h5 className="modal-title">{t("editTransaction")}</h5>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <input className="form-control mb-2" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              <input className="form-control mb-2" type="number" step="0.01" min="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
              <input className="form-control mb-2" placeholder={t("category")} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
              <textarea className="form-control" rows="2" placeholder={t("note")} value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">{t("cancel")}</button>
              <button className="btn btn-primary" data-bs-dismiss="modal" onClick={saveEdit}>{t("save")}</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default TransactionList;
