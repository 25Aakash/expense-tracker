import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PointElement,
} from 'chart.js';

ChartJS.register(LineElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, PointElement);

function ExpenseTrendChart({ expenses, type = 'line' }) {
  // Group by date (YYYY-MM-DD)
  const dailyTotals = {};
  expenses.forEach(exp => {
    const date = new Date(exp.date).toISOString().slice(0, 10);
    dailyTotals[date] = (dailyTotals[date] || 0) + Number(exp.amount);
  });

  const labels = Object.keys(dailyTotals).sort();
  const values = labels.map(date => dailyTotals[date]);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Daily Expenses',
        data: values,
        borderColor: '#0d6efd',
        backgroundColor: 'rgba(13, 110, 253, 0.3)',
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
    },
  };

  return (
    <div>
      <h5 className="mb-3 text-center">Expense Trend (Daily)</h5>
      {type === 'line' ? (
        <Line data={chartData} options={options} />
      ) : (
        <Bar data={chartData} options={options} />
      )}
    </div>
  );
}

export default ExpenseTrendChart;
