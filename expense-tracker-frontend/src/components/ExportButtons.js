import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useTranslation } from 'react-i18next';

function ExportButtons({ expenses }) {
  const { t } = useTranslation();

  const exportToCSV = () => {
    const headers = [`${t('title')},${t('amount')},${t('category')},${t('date')},${t('note')}`];
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
    doc.text(t('expenseReport'), 14, 15);

    const tableColumn = [t('title'), t('amount'), t('category'), t('date'), t('note')];
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
        {t('exportCSV')}
      </button>
      <button onClick={exportToPDF} className="btn btn-outline-danger">
        {t('exportPDF')}
      </button>
    </div>
  );
}

export default ExportButtons;
