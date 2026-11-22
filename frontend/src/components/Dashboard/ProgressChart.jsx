import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const GRID = 'rgba(160, 174, 192, 0.15)';
const TICK = '#a0aec0';

const ProgressChart = ({ data }) => {
  const chartData = {
    labels: data.map((r) => new Date(r.taken_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Score',
        data: data.map((r) => r.score),
        borderColor: '#2b6cb0',
        backgroundColor: 'rgba(43, 108, 176, 0.15)',
        pointBackgroundColor: '#e2e8f0',
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { min: 0, max: 100, ticks: { color: TICK, callback: (v) => `${v}%` }, grid: { color: GRID } },
      x: { ticks: { color: TICK, maxRotation: 0, autoSkip: true }, grid: { display: false } },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items) => data[items[0].dataIndex].topic,
          label: (item) => ` ${item.formattedValue}%`,
        },
      },
    },
  };

  return (
    <div className="h-64">
      <Line data={chartData} options={options} aria-label="Quiz scores over time" role="img" />
    </div>
  );
};

export default ProgressChart;
