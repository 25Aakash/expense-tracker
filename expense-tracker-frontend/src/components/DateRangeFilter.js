// src/components/DateRangeFilter.js
import React from 'react';

function DateRangeFilter({ fromDate, toDate, setFromDate, setToDate }) {
  return (
    <div className="d-flex justify-content-center gap-3 flex-wrap mb-3">
      <div>
        <label>From:</label>
        <input
          type="date"
          className="form-control"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />
      </div>
      <div>
        <label>To:</label>
        <input
          type="date"
          className="form-control"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />
      </div>
    </div>
  );
}

export default DateRangeFilter;
