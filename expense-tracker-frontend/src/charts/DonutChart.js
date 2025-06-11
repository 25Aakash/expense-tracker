// src/charts/DonutChart.js
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function DonutChart({ totalIncome, totalExpense }) {
  const balance = totalIncome - totalExpense;
  const total = totalIncome + totalExpense;

  const data = {
    labels: ['Income', 'Expense'],
    datasets: [
      {
        data: [totalIncome, totalExpense],
        backgroundColor: ['#00c853', '#d50000'],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#333', font: { size: 14 } },
      },
    },
  };

  return (
    <div className="position-relative d-flex justify-content-center align-items-center">
      <div style={{ width: '300px' }}>
        <Doughnut data={data} options={options} />
      </div>
      <div className="position-absolute text-center">
        <h4 className="text-primary">Balance</h4>
        <h5 className="fw-bold">₹{balance}</h5>
      </div>
    </div>
  );
}

export default DonutChart;
