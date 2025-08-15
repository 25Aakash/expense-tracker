// src/charts/ExpenseChart.js
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useTranslation } from 'react-i18next';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function ExpenseChart({ expenses }) {
  const { t } = useTranslation();

  /* ---------- aggregate totals ---------- */
  const categoryTotals = {};
  expenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const data = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        label: t('expensesByCategory'),
        data: Object.values(categoryTotals),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: t('expensesByCategory'),
      },
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: value => `₹${value}`,
        },
      },
    },
  };

  return (
    <div>
      <h5 className="mb-3 text-center">{t('expenseChart')}</h5>
      <Bar data={data} options={options} />
    </div>
  );
}

export default ExpenseChart;
