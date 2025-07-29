import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const produkTerlaris = [
  { nama: 'Gula Pasir', terjual: 120, pendapatan: 1800000 },
  { nama: 'Tepung Terigu', terjual: 90, pendapatan: 900000 },
  { nama: 'Minyak Goreng', terjual: 75, pendapatan: 1125000 },
];

const formatRupiah = (angka) => {
  return 'Rp ' + angka.toLocaleString('id-ID');
};

const LaporanTerlaris = () => {
  return (
    <div className="min-h-screen bg-gradient-to-tr from-white via-blue-50 to-jade-50 flex flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8">
          <div className="w-full">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-gray-800">Laporan Produk Terlaris</h1>
            </div>
            <table className="min-w-full bg-white rounded-lg shadow">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Nama Produk</th>
                  <th className="px-4 py-2 text-left">Total Terjual</th>
                  <th className="px-4 py-2 text-left">Total Pendapatan</th>
                </tr>
              </thead>
              <tbody>
                {produkTerlaris.map((p, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2">{p.nama}</td>
                    <td className="px-4 py-2">{p.terjual}</td>
                    <td className="px-4 py-2">{formatRupiah(p.pendapatan)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LaporanTerlaris; 