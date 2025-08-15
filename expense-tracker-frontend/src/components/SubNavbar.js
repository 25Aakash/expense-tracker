import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IoChevronBackSharp } from 'react-icons/io5';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { parseISO, format } from 'date-fns';
import { useTranslation } from 'react-i18next';

function SubNavbar({ incomes = [], expenses = [], fromDate, toDate }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const permissions = JSON.parse(localStorage.getItem('permissions') || '{}');

  const pageNames = {
    "/transactions": t("transactions"),
    "/reports": t("reports"),
    "/categories": t("categories"),
  };

  const currentPage = pageNames[location.pathname] || "";

  const filterByDate = (data) => {
    if (!fromDate || !toDate) return data;
    return data.filter(entry => {
      const date = parseISO(entry.date);
      return date >= parseISO(fromDate) && date <= parseISO(toDate);
    });
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(`${currentPage} ${t("reports")}`, 14, 16);

    const filteredIncomes = filterByDate(incomes);
    const filteredExpenses = filterByDate(expenses);

    autoTable(doc, {
      head: [[t("type"), t("amount"), t("category"), t("date")]],
      body: [
        ...filteredIncomes.map(i => [t("income"), i.amount, i.category, format(parseISO(i.date), 'yyyy-MM-dd')]),
        ...filteredExpenses.map(e => [t("expense"), e.amount, e.category, format(parseISO(e.date), 'yyyy-MM-dd')])
      ],
    });

    doc.save(`${currentPage}-report.pdf`);
  };

  const exportCSV = () => {
    const filteredIncomes = filterByDate(incomes);
    const filteredExpenses = filterByDate(expenses);

    const rows = [
      [t("type"), t("amount"), t("category"), t("date")],
      ...filteredIncomes.map(i => [t("income"), i.amount, i.category, format(parseISO(i.date), 'yyyy-MM-dd')]),
      ...filteredExpenses.map(e => [t("expense"), e.amount, e.category, format(parseISO(e.date), 'yyyy-MM-dd')])
    ];
    const csv = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentPage}-report.csv`;
    a.click();
  };

  return (
    <>
      <nav className="navbar navbar-light bg-white shadow-sm sticky-top px-3 py-2">
        <div className="container-fluid d-flex align-items-center gap-3 flex-wrap">
          <button
            className="btn btn-outline-primary rounded-circle"
            onClick={() => navigate('/')}
            title={t("backToDashboard")}
          >
            <IoChevronBackSharp size={22} />
          </button>

          <h5 className="mb-0 fw-bold text-primary">{currentPage}</h5>

          <div className="ms-auto d-flex gap-2">
            {permissions.canExport &&
              (location.pathname === "/transactions" || location.pathname === "/reports") && (
                <button
                  className="btn btn-outline-success d-flex align-items-center gap-2"
                  data-bs-toggle="modal"
                  data-bs-target="#exportModal"
                >
                  <i className="bi bi-download" /> {t("save")}
                </button>
              )}
          </div>
        </div>
      </nav>

      {/* Export Modal */}
      <div className="modal fade" id="exportModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content p-3">
            <div className="modal-header">
              <h5 className="modal-title">{t("exportOptions")}</h5>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body d-grid gap-3">
              <button className="btn btn-outline-primary" onClick={exportPDF} data-bs-dismiss="modal">
                📄 {t("exportAsPDF")}
              </button>
              <button className="btn btn-outline-primary" onClick={exportCSV} data-bs-dismiss="modal">
                📁 {t("exportAsCSV")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SubNavbar;
