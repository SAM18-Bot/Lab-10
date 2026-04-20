import React, { useMemo, useState } from 'react';
import CsvUploader from './components/CsvUploader';
import FilterPanel from './components/FilterPanel';
import ResultsChart from './components/ResultsChart';
import { filterDataset, uploadCsv } from './services/api';

const App = () => {
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    column: '',
    operator: 'equals',
    value: ''
  });

  const stats = useMemo(() => ({
    rowCount: rows.length,
    columnCount: columns.length
  }), [rows, columns]);

  const handleUpload = async (file) => {
    setLoading(true);
    setError('');
    try {
      const payload = await uploadCsv(file);
      setRows(payload.rows);
      setColumns(payload.columns);
      setFilters((prev) => ({ ...prev, column: payload.columns[0] || '' }));
    } catch {
      setError('Unable to process file. Ensure it is a valid CSV.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyFilter = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = await filterDataset({
        rows,
        ...filters
      });
      setRows(payload.rows);
    } catch {
      setError('Failed to apply filter.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <header>
        <h1>InsightFlow Analytics</h1>
        <p>Upload CSV files, filter records, and visualize metrics in seconds.</p>
      </header>

      {error && <p className="error">{error}</p>}

      <section className="grid">
        <CsvUploader onUpload={handleUpload} loading={loading} />
        <FilterPanel
          filters={filters}
          onChange={handleFilterChange}
          onApply={handleApplyFilter}
          loading={loading}
          availableColumns={columns}
        />
      </section>

      <section className="panel stats-panel">
        <div>
          <span className="stat-label">Rows</span>
          <strong>{stats.rowCount}</strong>
        </div>
        <div>
          <span className="stat-label">Columns</span>
          <strong>{stats.columnCount}</strong>
        </div>
      </section>

      <ResultsChart rows={rows} />
    </main>
  );
};

export default App;
