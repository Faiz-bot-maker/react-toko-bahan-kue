import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const laporanGlobal = [
  { nama: 'Gula Pasir', total: 320, cabang: 'Cabang 1', omzet: 4800000 },
  { nama: 'Tepung Terigu', total: 250, cabang: 'Cabang 1', omzet: 2500000 },
  { nama: 'Minyak Goreng', total: 180, cabang: 'Cabang 2', omzet: 2700000 },
  { nama: 'Coklat Bubuk', total: 95, cabang: 'Cabang 2', omzet: 1425000 },
];

const formatRupiah = (angka) => {
  return 'Rp ' + angka.toLocaleString('id-ID');
};

const LaporanPenjualanGlobal = () => {
  const [filterCabang, setFilterCabang] = useState('Semua');

  // Filter data sesuai cabang yang dipilih
  const dataTampil =
    filterCabang === 'Semua'
      ? laporanGlobal
      : laporanGlobal.filter((item) => item.cabang === filterCabang);

  // Hitung total omzet & total produk
  const totalOmzet = dataTampil.reduce((sum, item) => sum + item.omzet, 0);
  const totalProduk = dataTampil.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="min-h-screen bg-gradient-to-tr from-white via-blue-50 to-jade-50 flex flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8">
          <div className="w-full">

            {/* Tombol Filter */}
            <div className="flex gap-2 mb-6">
              <button
                className={`px-4 py-2 rounded ${
                  filterCabang === 'Semua'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
                onClick={() => setFilterCabang('Semua')}
              >
                All
              </button>
              <button
                className={`px-4 py-2 rounded ${
                  filterCabang === 'Cabang 1'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
                onClick={() => setFilterCabang('Cabang 1')}
              >
                Cabang 1
              </button>
              <button
                className={`px-4 py-2 rounded ${
                  filterCabang === 'Cabang 2'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
                onClick={() => setFilterCabang('Cabang 2')}
              >
                Cabang 2
              </button>
            </div>

            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-800">
                Laporan Penjualan {filterCabang === 'Semua' ? 'Semua Cabang' : filterCabang}
              </h1>
            </div>

            {/* Holder Info Total */}
            <div className="mb-4 p-4 bg-gray-500 rounded-md shadow-sm border border-gray-300 flex justify-between items-center">
              <p className="text-lg font-semibold text-white">
                Total Produk Terjual: <span className="font-bold text-white">{totalProduk}</span>
              </p>
              <p className="text-lg font-semibold text-white">
                Total Omzet: <span className="font-bold text-green-450">{formatRupiah(totalOmzet)}</span>
              </p>
            </div>

            {/* Tabel */}
            <table className="min-w-full bg-white rounded-lg shadow overflow-hidden">
              <thead className="bg-gray-500">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-white">Nama Produk</th>
                  <th className="px-4 py-2 text-left font-semibold text-white">Total Terjual</th>
                  <th className="px-4 py-2 text-left font-semibold text-white">Cabang</th>
                  <th className="px-4 py-2 text-left font-semibold text-white">Omzet</th>
                </tr>
              </thead>
              <tbody>
                {dataTampil.map((item, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50 border-b border-gray-200"
                  >
                    <td className="px-4 py-2">{item.nama}</td>
                    <td className="px-4 py-2">{item.total}</td>
                    <td className="px-4 py-2">{item.cabang}</td>
                    <td className="px-4 py-2">{formatRupiah(item.omzet)}</td>
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

export default LaporanPenjualanGlobal;
