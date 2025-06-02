import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // ✅ Correct import

function ExportButtons({ expenses }) {
  const exportToCSV = () => {
    const headers = ['Title,Amount,Category,Date,Note'];
    const rows = expenses.map(exp =>
      `${exp.title},${exp.amount},${exp.category},${new Date(exp.date).toLocaleDateString()},${exp.note || ''}`
    );
    const csvContent = [headers, ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'expenses.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Expense Report', 14, 15);

    const tableColumn = ['Title', 'Amount', 'Category', 'Date', 'Note'];
    const tableRows = expenses.map(exp => [
      exp.title,
      `₹${exp.amount}`,
      exp.category,
      new Date(exp.date).toLocaleDateString(),
      exp.note || ''
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save('expenses.pdf');
  };

  return (
    <div className="mb-3 d-flex justify-content-end gap-2">
      <button onClick={exportToCSV} className="btn btn-outline-primary">
        Export CSV
      </button>
      <button onClick={exportToPDF} className="btn btn-outline-danger">
        Export PDF
      </button>
    </div>
  );
}

export default ExportButtons;
