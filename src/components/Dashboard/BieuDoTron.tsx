"use client";

import Image from "next/image";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const data = [
  { name: "Nam", count: 53, fill: "#FAE27C" },
  { name: "Nữ", count: 53, fill: "#C3EBFA" },
];

const chartData = {
  labels: data.map((d) => d.name),
  datasets: [
    {
      data: data.map((d) => d.count),
      backgroundColor: data.map((d) => d.fill),
      borderWidth: 0,
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "60%",
  plugins: {
    legend: { display: false },
  },
};

const BieuDoTron = () => {
  return (
    <div className="bg-white rounded-xl w-full h-full p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Giới Tính</h1>
        <Image src="/icons/moreDark.png" alt="" width={20} height={20} />
      </div>
      <div className="relative w-full h-[75%] min-h-[180px]">
        <Doughnut data={chartData} options={chartOptions} />
        <Image
          src="/icons/maleFemale.png"
          alt=""
          width={50}
          height={50}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        />
      </div>
      <div className="flex justify-center gap-16">
        <div className="flex flex-col gap-1">
          <div className="w-5 h-5 bg-zMauXanhNhat rounded-full" />
          <h1 className="font-bold">1,234</h1>
          <h2 className="text-xs text-gray-700">Nam (55%)</h2>
        </div>
        <div className="flex flex-col gap-1">
          <div className="w-5 h-5 bg-zMauVang rounded-full" />
          <h1 className="font-bold">1,234</h1>
          <h2 className="text-xs text-gray-700">Nữ (45%)</h2>
        </div>
      </div>
    </div>
  );
};

export default BieuDoTron;
