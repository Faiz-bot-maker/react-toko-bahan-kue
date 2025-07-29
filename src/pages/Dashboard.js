import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { HiOutlineHome, HiOutlineCube, HiOutlineClipboardList, HiOutlineTruck } from 'react-icons/hi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const stats = [
  {
    label: 'Total Pesanan',
    value: 120,
    icon: <HiOutlineClipboardList className="text-4xl text-blue-500" />,
    color: 'from-blue-400/30 to-blue-100',
    shadow: 'shadow-blue-100',
  },
  {
    label: 'Total Suplier',
    value: 8,
    icon: <HiOutlineTruck className="text-4xl text-orange-500" />,
    color: 'from-orange-400/30 to-orange-100',
    shadow: 'shadow-orange-100',
  },
  {
    label: 'Total Produk',
    value: 24,
    icon: <HiOutlineCube className="text-4xl text-jade-600" />,
    color: 'from-jade-400/30 to-jade-100',
    shadow: 'shadow-jade-100',
  },
];

const chartData = [
  { bulan: 'Jan', penjualan: 10 },
  { bulan: 'Feb', penjualan: 15 },
  { bulan: 'Mar', penjualan: 8 },
  { bulan: 'Apr', penjualan: 20 },
  { bulan: 'Mei', penjualan: 18 },
  { bulan: 'Jun', penjualan: 25 },
];

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-tr from-white via-blue-50 to-jade-50 flex flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-8">
          <div className="w-full">
            <div className="flex items-center gap-3 mb-8">
              {/* <div className="bg-gradient-to-tr from-jade-100 to-blue-100 p-3 rounded-full shadow">
                <HiOutlineHome className="text-jade-500 text-3xl" />
              </div> */}
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight drop-shadow"></h1>
            </div>
            {/* Card Statistik */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`flex items-center gap-4 p-8 rounded-3xl bg-gradient-to-br ${stat.color} ${stat.shadow} shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group cursor-pointer border border-gray-100 backdrop-blur-md`}
                >
                  <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-white/90 group-hover:scale-110 transition-transform shadow-lg">
                    {stat.icon}
                  </div>
                  <div>
                    <div className="text-4xl font-extrabold text-gray-900 group-hover:text-jade-700 transition-colors drop-shadow">{stat.value}</div>
                    <div className="text-gray-700 text-lg font-semibold">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-lg font-bold mb-4 text-gray-800">Grafik Penjualan per Bulan</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bulan" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="penjualan" stroke="#16a34a" strokeWidth={3} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard; 