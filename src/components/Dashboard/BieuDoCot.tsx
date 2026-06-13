"use client";

import { Bar } from 'react-chartjs-2';
import { registerChartJS } from '@/lib/chartConfig';

// Register Chart.js components
registerChartJS();

const BieuDoCot = () => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Thống kê theo tháng',
        font: {
          size: 16,
          weight: 700
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const labels = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9'];

  const data = {
    labels,
    datasets: [
      {
        label: 'Công cụ hỗ trợ',
        data: [65, 59, 80, 81, 56, 55, 22, 45, 90],
        backgroundColor: '#1E88E5',
        borderColor: '#1565C0',
        borderWidth: 1,
      },
      {
        label: 'Chữ ký số',
        data: [28, 48, 40, 19, 86, 27, 67, 34, 56],
        backgroundColor: '#43A047',
        borderColor: '#2E7D32',
        borderWidth: 1,
      },
      {
        label: 'DS phiếu EMR',
        data: [45, 25, 32, 51, 48, 59, 99, 68, 89],
        backgroundColor: '#5E35B1',
        borderColor: '#4527A0',
        borderWidth: 1,
      },
      {
        label: 'Tờ điều trị',
        data: [35, 42, 50, 32, 45, 38, 11, 23, 92],
        backgroundColor: '#FB8C00',
        borderColor: '#EF6C00',
        borderWidth: 1,
      }
    ],
  };

  return <Bar options={options} data={data} />;
};

export default BieuDoCot;