// src/charts/ExpenseChart.js
import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function ExpenseChart({ expenses }) {
  const categoryTotals = {};
  expenses.forEach((exp) => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + Number(exp.amount);
  });

  const data = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        label: 'Expenses by Category',
        data: Object.values(categoryTotals),
        backgroundColor: [
          '#0d6efd',
          '#198754',
          '#dc3545',
          '#fd7e14',
          '#6f42c1',
          '#20c997',
          '#0dcaf0',
          '#ffc107',
        ],
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  return (
    <div>
      <h5 className="mb-3 text-center">Expenses by Category</h5>
      <div className="d-flex justify-content-center">
        <div className="w-100" style={{ maxWidth: 300 }}>
          <Pie data={data} />
        </div>
      </div>
    </div>
  );
}

export default ExpenseChart;
