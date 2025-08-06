import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const orders = [
  { id: '001', status: 'Selesai' },
  { id: '002', status: 'Diproses' },
  { id: '003', status: 'Dibatalkan' },
];

const statusColor = {
  Selesai: 'bg-gradient-to-r from-jade-200 to-jade-50 text-jade-800 border-jade-200',
  Diproses: 'bg-gradient-to-r from-blue-200 to-blue-50 text-blue-800 border-blue-200',
  Dibatalkan: 'bg-gradient-to-r from-red-200 to-red-50 text-red-800 border-red-200',
};

const Orders = () => {
  return (
    <div className="min-h-screen bg-gradient-to-tr from-white via-blue-50 to-jade-50 flex flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8">
          <div className="w-full">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-extrabold text-gray-900 drop-shadow">Daftar Pesanan</h1>
            </div>
            <div className="overflow-x-auto shadow-xl rounded-lg border border-gray-200 bg-white">
              <table className="min-w-full text-sm text-gray-800">
                <thead className="bg-gray-600 text-white text-sm uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold text-white-700 w-12">No</th>
                    <th className="px-4 py-3 text-left font-bold text-white-700">ID Pesanan</th>
                    <th className="px-4 py-3 text-left font-bold text-white-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-center text-gray-400">Belum ada pesanan.</td>
                    </tr>
                  )}
                  {orders.map((order, idx) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-jade-50 transition-all">
                      <td className="px-4 py-2 font-semibold">{idx + 1}</td>
                      <td className="px-4 py-2 text-gray-800 font-semibold">{order.id}</td>
                      <td className="px-4 py-2">
                        <span className={`px-4 py-1 rounded-full border text-sm font-bold shadow ${statusColor[order.status]} transition-all`}>{order.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Orders; 