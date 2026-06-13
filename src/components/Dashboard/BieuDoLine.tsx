"use client";

import { Line } from 'react-chartjs-2';
import { registerChartJS } from '@/lib/chartConfig';

// Register Chart.js components
registerChartJS();

const BieuDoLine = () => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'center' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Thống kê theo quý',
        font: {
          size: 16,
          weight: 700
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#000',
        titleFont: {
          size: 14,
          weight: 700
        },
        bodyColor: '#666',
        bodyFont: {
          size: 13
        },
        borderColor: '#ddd',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        beginAtZero: true,
        grid: {
          color: '#f0f0f0',
          drawBorder: false,
        },
        ticks: {
          maxTicksLimit: 8,
          padding: 10,
          color: '#666',
          font: {
            size: 11
          }
        },
        border: {
          display: false
        }
      },
      x: {
        type: 'category' as const,
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          padding: 10,
          color: '#666',
          font: {
            size: 11
          }
        },
        border: {
          display: false
        }
      }
    }
  };

  const labels = ['Q1', 'Q2', 'Q3', 'Q4'];

  const data = {
    labels,
    datasets: [
      {
        label: 'Công cụ hỗ trợ',
        data: [65, 59, 80, 81],
        borderColor: '#1E88E5',
        backgroundColor: 'rgba(30, 136, 229, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#1E88E5',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Chữ ký số',
        data: [28, 48, 40, 19],
        borderColor: '#43A047',
        backgroundColor: 'rgba(67, 160, 71, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#43A047',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'DS phiếu EMR',
        data: [45, 25, 32, 51],
        borderColor: '#5E35B1',
        backgroundColor: 'rgba(94, 53, 177, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#5E35B1',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Tờ điều trị',
        data: [35, 42, 50, 32],
        borderColor: '#FB8C00',
        backgroundColor: 'rgba(251, 140, 0, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#FB8C00',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      }
    ],
  };

  return <Line options={options} data={data} />;
};

export default BieuDoLine;