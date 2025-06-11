import React from 'react';

function IncomeList({ incomes }) {
  return (
    <div className="card mt-4">
      <div className="card-header bg-success text-white">
        <h5 className="mb-0">Recent Incomes</h5>
      </div>
      <div className="card-body p-0">
        {incomes.length === 0 ? (
          <p className="p-3 mb-0">No income records found.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Amount (₹)</th>
                  <th>Category</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {incomes.map((income) => (
                  <tr key={income._id}>
                    <td>{new Date(income.date).toLocaleDateString()}</td>
                    <td>₹{income.amount}</td>
                    <td>{income.category}</td>
                    <td>{income.note || '-'}</td>
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
