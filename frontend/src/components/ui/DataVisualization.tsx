import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// 注册Chart.js组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface DataVisualizationProps {
  type: 'line' | 'bar' | 'pie';
  data: any;
  options?: any;
  className?: string;
}

const DataVisualization: React.FC<DataVisualizationProps> = ({
  type,
  data,
  options,
  className = '',
}) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#f0f0f0',
        },
      },
      title: {
        display: true,
        text: '数据统计',
        color: '#ffffff',
        font: {
          family: 'Orbitron',
          size: 16,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#f0f0f0',
        },
        grid: {
          color: 'rgba(240, 240, 240, 0.1)',
        },
      },
      y: {
        ticks: {
          color: '#f0f0f0',
        },
        grid: {
          color: 'rgba(240, 240, 240, 0.1)',
        },
      },
    },
  };

  const mergedOptions = { ...defaultOptions, ...options };

  return (
    <div className={`h-80 ${className}`}>
      {type === 'line' && <Line data={data} options={mergedOptions} />}
      {type === 'bar' && <Bar data={data} options={mergedOptions} />}
      {type === 'pie' && <Pie data={data} options={mergedOptions} />}
    </div>
  );
};

export default DataVisualization;