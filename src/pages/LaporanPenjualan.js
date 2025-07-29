import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const LaporanPenjualan = () => {
  return (
    <div className="min-h-screen bg-gradient-to-tr from-white via-blue-50 to-jade-50 flex flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8">
          <div className="w-full">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-gray-800">Laporan Penjualan</h1>
            </div>
            <table className="min-w-full bg-white rounded-lg shadow">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Tanggal</th>
                  <th className="px-4 py-2 text-left">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2">2024-06-01</td>
                  <td className="px-4 py-2">Rp 1.000.000</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">2024-06-02</td>
                  <td className="px-4 py-2">Rp 750.000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LaporanPenjualan; 