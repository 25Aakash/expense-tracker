// src/components/ExpenseList.js
import React from 'react';

function ExpenseList({ expenses }) {
  return (
    <div>
      <h5 className="mb-3">Recent Expenses</h5>
      {expenses.length === 0 ? (
        <p className="text-muted">No expenses found.</p>
      ) : (
        <ul className="list-group">
          {expenses.map((exp) => (
            <li key={exp._id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <strong>{exp.title}</strong> <br />
                <small className="text-muted">{new Date(exp.date).toLocaleDateString()} | {exp.category}</small><br />
                <small className="text-muted">{exp.note}</small>
              </div>
              <span className="badge bg-success fs-6">₹{exp.amount}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ExpenseList;
