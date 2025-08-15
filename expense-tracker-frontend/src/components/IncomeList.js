import React from 'react';
import { getPerms } from '../utils/getPerms';
import { useTranslation } from 'react-i18next';

function IncomeList({ incomes = [] }) {
  const { canEdit, canDelete } = getPerms();
  const { t } = useTranslation();

  return (
    <div className="card mt-4">
      <div className="card-header bg-success text-white">
        <h5 className="mb-0">{t('recentIncomes')}</h5>
      </div>

      <div className="card-body p-0">
        {incomes.length === 0 ? (
          <p className="p-3 mb-0">{t('noIncomeRecords')}</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>{t('date')}</th>
                  <th>{t('amount')}</th>
                  <th>{t('category')}</th>
                  <th>{t('note')}</th>
                  {(canEdit || canDelete) && <th>{t('actions')}</th>}
                </tr>
              </thead>
              <tbody>
                {incomes.map((inc) => (
                  <tr key={inc._id}>
                    <td>{new Date(inc.date).toLocaleDateString()}</td>
                    <td>₹{inc.amount}</td>
                    <td>{inc.category}</td>
                    <td>{inc.note || '-'}</td>
                    {(canEdit || canDelete) && (
                      <td>
                        {canEdit && (
                          <button className="btn btn-sm btn-warning me-1" disabled>
                            {t('edit')}
                          </button>
                        )}
                        {canDelete && (
                          <button className="btn btn-sm btn-danger" disabled>
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
export default IncomeList;
