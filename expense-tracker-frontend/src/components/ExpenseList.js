import React from 'react';
import { useTranslation } from 'react-i18next';
import { getPerms } from '../utils/getPerms';

function ExpenseList({ expenses = [] }) {
  const { t } = useTranslation();
  const { canEdit, canDelete } = getPerms();   // fresh perms from localStorage

  return (
    <div className="card mt-4">
      {/* ─── Card header ─── */}
      <div className="card-header bg-danger text-white">
        <h5 className="mb-0">{t('recentExpenses')}</h5>
      </div>

      {/* ─── Card body ─── */}
      <div className="card-body p-0">
        {expenses.length === 0 ? (
          <p className="p-3 mb-0">{t('noExpensesFound')}</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>{t('date')}</th>
                  <th>{t('amountRs')}</th>
                  <th>{t('category')}</th>
                  <th>{t('note')}</th>
                  {(canEdit || canDelete) && <th>{t('actions')}</th>}
                </tr>
              </thead>
              <tbody>
                {expenses.map(exp => (
                  <tr key={exp._id}>
                    <td>{new Date(exp.date).toLocaleDateString()}</td>
                    <td>₹{exp.amount}</td>
                    <td>{exp.category}</td>
                    <td>{exp.note || '-'}</td>

                    {(canEdit || canDelete) && (
                      <td>
                        {canEdit && (
                          <button
                            className="btn btn-sm btn-warning me-1"
                            disabled   // wired-up in future
                          >
                            {t('edit')}
                          </button>
                        )}

                        {canDelete && (
                          <button
                            className="btn btn-sm btn-danger"
                            disabled   // wired-up in future
                          >
                            {t('delete')}
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ExpenseList;
