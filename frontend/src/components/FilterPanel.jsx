import React from 'react';

const FilterPanel = ({ filters, onChange, onApply, loading, availableColumns }) => (
  <section className="panel">
    <h3>Filter Rows</h3>
    <label htmlFor="column">Column</label>
    <select
      id="column"
      value={filters.column}
      onChange={(event) => onChange('column', event.target.value)}
    >
      <option value="">Select column</option>
      {availableColumns.map((column) => (
        <option key={column} value={column}>
          {column}
        </option>
      ))}
    </select>

    <label htmlFor="operator">Operator</label>
    <select
      id="operator"
      value={filters.operator}
      onChange={(event) => onChange('operator', event.target.value)}
    >
      <option value="equals">Equals</option>
      <option value="contains">Contains</option>
      <option value="greater_than">Greater than</option>
      <option value="less_than">Less than</option>
    </select>

    <label htmlFor="value">Value</label>
    <input
      id="value"
      type="text"
      placeholder="Filter value"
      value={filters.value}
      onChange={(event) => onChange('value', event.target.value)}
    />

    <button
      className="btn"
      type="button"
      onClick={onApply}
      disabled={!filters.column || loading}
    >
      {loading ? 'Applying...' : 'Apply Filter'}
    </button>
  </section>
);

export default FilterPanel;
