import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const ResultsChart = ({ rows }) => {
  if (!rows.length) {
    return (
      <section className="panel">
        <h3>Visualization</h3>
        <p>No data loaded yet.</p>
      </section>
    );
  }

  const keys = Object.keys(rows[0]);
  const xKey = keys[0];
  const yKey = keys.find((key) => !Number.isNaN(Number(rows[0][key]))) || keys[1] || keys[0];

  const chartData = rows.slice(0, 20).map((row) => ({
    [xKey]: row[xKey],
    [yKey]: Number(row[yKey]) || 0
  }));

  return (
    <section className="panel chart-panel">
      <h3>Visualization</h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Bar dataKey={yKey} fill="#4f46e5" />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
};

export default ResultsChart;
