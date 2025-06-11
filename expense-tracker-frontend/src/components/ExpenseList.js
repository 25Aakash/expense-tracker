import React from 'react';

function ExpenseList({ expenses, filters, setFilters }) {
  return (
    <div className="card mt-4">
      <div className="card-header bg-danger text-white">
        <h5 className="mb-0">Recent Expenses</h5>
      </div>

      <div className="card-body">
        {/* Table */}
        {expenses.length === 0 ? (
          <p>No expenses found.</p>
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
                {expenses.map((expense) => (
                  <tr key={expense._id}>
                    <td>{new Date(expense.date).toLocaleDateString()}</td>
                    <td>₹{expense.amount}</td>
                    <td>{expense.category}</td>
                    <td>{expense.note || '-'}</td>
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
