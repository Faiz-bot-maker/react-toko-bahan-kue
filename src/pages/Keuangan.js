import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Data dummy keuangan per bulan
const dataKeuangan = [
  {
    bulan: 'Juni', tahun: 2024,
    modal: 2000000, penjualan: 5000000, pendapatanLain: 500000,
    pengeluaranOperasional: 2000000, gajiPegawai: 1000000, pengeluaranLain: 300000, piutang: 745000,
  },
  {
    bulan: 'Mei', tahun: 2024,
    modal: 2000000, penjualan: 4500000, pendapatanLain: 200000,
    pengeluaranOperasional: 1800000, gajiPegawai: 1000000, pengeluaranLain: 150000, piutang: 295000,
  },
  {
    bulan: 'April', tahun: 2024,
    modal: 2000000, penjualan: 4200000, pendapatanLain: 0,
    pengeluaranOperasional: 1500000, gajiPegawai: 1000000, pengeluaranLain: 100000, piutang: 0,
  },
  {
    bulan: 'Maret', tahun: 2024,
    modal: 2000000, penjualan: 3800000, pendapatanLain: 0,
    pengeluaranOperasional: 1200000, gajiPegawai: 1000000, pengeluaranLain: 50000, piutang: 0,
  },
  {
    bulan: 'Desember', tahun: 2023,
    modal: 2000000, penjualan: 4000000, pendapatanLain: 100000,
    pengeluaranOperasional: 1700000, gajiPegawai: 900000, pengeluaranLain: 120000, piutang: 100000,
  },
  {
    bulan: 'November', tahun: 2023,
    modal: 2000000, penjualan: 3500000, pendapatanLain: 50000,
    pengeluaranOperasional: 1400000, gajiPegawai: 900000, pengeluaranLain: 80000, piutang: 50000,
  },
];

const bulanList = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const formatRupiah = (angka) => 'Rp ' + angka.toLocaleString('id-ID');
const getTahunList = (data) => Array.from(new Set(data.map(d => d.tahun))).sort((a, b) => b - a);

const Keuangan = () => {
  const tahunList = getTahunList(dataKeuangan);
  const [tahun, setTahun] = useState(tahunList[0]);
  const [bulan, setBulan] = useState('');

  // Filter data
  let filteredData = dataKeuangan.filter(d => d.tahun === tahun);
  if (bulan) filteredData = filteredData.filter(d => d.bulan === bulan);

  // Data untuk grafik
  const chartData = filteredData.map(row => {
    const totalPemasukan = row.penjualan + row.pendapatanLain;
    const totalPengeluaran = row.pengeluaranOperasional + row.gajiPegawai + row.pengeluaranLain;
    const labaKotor = totalPemasukan - totalPengeluaran;
    const labaBersih = labaKotor - row.piutang;
    return {
      bulan: row.bulan,
      'Laba Kotor': labaKotor,
      'Laba Bersih': labaBersih,
      'Total Pemasukan': totalPemasukan,
      'Total Pengeluaran': totalPengeluaran,
    };
  });

  // Grafik pemasukan/pengeluaran
  const chartPemasukanPengeluaran = filteredData.map(row => {
    const totalPemasukan = row.penjualan + row.pendapatanLain;
    const totalPengeluaran = row.pengeluaranOperasional + row.gajiPegawai + row.pengeluaranLain;
    return {
      bulan: row.bulan,
      'Total Pemasukan': totalPemasukan,
      'Total Pengeluaran': totalPengeluaran,
    };
  });

  // Export ke Excel
  const handleExportExcel = () => {
    const exportData = filteredData.map(row => {
      const totalPemasukan = row.penjualan + row.pendapatanLain;
      const totalPengeluaran = row.pengeluaranOperasional + row.gajiPegawai + row.pengeluaranLain;
      const labaKotor = totalPemasukan - totalPengeluaran;
      const labaBersih = labaKotor - row.piutang;
      const uangBersih = row.modal + labaBersih;
      return {
        Bulan: row.bulan,
        'Modal Awal': row.modal,
        Penjualan: row.penjualan,
        'Pendapatan Lain': row.pendapatanLain,
        'Total Pemasukan': totalPemasukan,
        Operasional: row.pengeluaranOperasional,
        'Gaji Pegawai': row.gajiPegawai,
        'Pengeluaran Lain': row.pengeluaranLain,
        'Total Pengeluaran': totalPengeluaran,
        'Laba Kotor': labaKotor,
        Piutang: row.piutang,
        'Laba Bersih': labaBersih,
        'Uang Bersih': uangBersih,
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Keuangan');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), `Laporan_Keuangan_${tahun}${bulan ? '_' + bulan : ''}.xlsx`);
  };

  // Export ke PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text(`Laporan Keuangan Tahun ${tahun}${bulan ? ' Bulan ' + bulan : ''}`, 14, 16);
    const tableColumn = [
      'Bulan', 'Modal', 'Penjualan', 'Pendapatan Lain', 'Total Pemasukan',
      'Operasional', 'Gaji Pegawai', 'Pengeluaran Lain', 'Total Pengeluaran',
      'Laba Kotor', 'Piutang', 'Laba Bersih', 'Uang Bersih'
    ];
    const tableRows = filteredData.map(row => {
      const totalPemasukan = row.penjualan + row.pendapatanLain;
      const totalPengeluaran = row.pengeluaranOperasional + row.gajiPegawai + row.pengeluaranLain;
      const labaKotor = totalPemasukan - totalPengeluaran;
      const labaBersih = labaKotor - row.piutang;
      const uangBersih = row.modal + labaBersih;
      return [
        row.bulan,
        formatRupiah(row.modal),
        formatRupiah(row.penjualan),
        formatRupiah(row.pendapatanLain),
        formatRupiah(totalPemasukan),
        formatRupiah(row.pengeluaranOperasional),
        formatRupiah(row.gajiPegawai),
        formatRupiah(row.pengeluaranLain),
        formatRupiah(totalPengeluaran),
        formatRupiah(labaKotor),
        formatRupiah(row.piutang),
        formatRupiah(labaBersih),
        formatRupiah(uangBersih),
      ];
    });
    doc.autoTable({ head: [tableColumn], body: tableRows, startY: 22, styles: { fontSize: 8 } });
    doc.save(`Laporan_Keuangan_${tahun}${bulan ? '_' + bulan : ''}.pdf`);
  };

  // Rangkuman saldo akhir tahun
  const saldoAkhirTahun = dataKeuangan
    .filter(d => d.tahun === tahun)
    .reduce((acc, row) => {
      const totalPemasukan = row.penjualan + row.pendapatanLain;
      const totalPengeluaran = row.pengeluaranOperasional + row.gajiPegawai + row.pengeluaranLain;
      const labaKotor = totalPemasukan - totalPengeluaran;
      const labaBersih = labaKotor - row.piutang;
      return acc + (row.modal + labaBersih);
    }, 0);

  return (
    <div className="flex h-screen bg-gradient-to-tr from-white via-blue-50 to-jade-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md shadow-sm">
          <Header />
        </div>
        <main className="flex-1 overflow-y-auto p-8 min-w-0">
          <div className="w-full">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
              <h1 className="text-2xl font-bold text-gray-800">Laporan Keuangan Profesional</h1>
              <div className="flex gap-2 items-center flex-wrap">
                <label htmlFor="tahun" className="font-medium text-gray-700">Tahun:</label>
                <select
                  id="tahun"
                  className="border rounded px-2 py-1"
                  value={tahun}
                  onChange={e => { setTahun(Number(e.target.value)); setBulan(''); }}
                >
                  {tahunList.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <label htmlFor="bulan" className="font-medium text-gray-700 ml-2">Bulan:</label>
                <select
                  id="bulan"
                  className="border rounded px-2 py-1"
                  value={bulan}
                  onChange={e => setBulan(e.target.value)}
                >
                  <option value="">Semua</option>
                  {bulanList.map(b => (
                    dataKeuangan.some(d => d.tahun === tahun && d.bulan === b) && (
                      <option key={b} value={b}>{b}</option>
                    )
                  ))}
                </select>
                <button
                  onClick={handleExportExcel}
                  className="ml-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow font-semibold transition"
                >
                  Export Excel
                </button>
                <button
                  onClick={handleExportPDF}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow font-semibold transition"
                >
                  Export PDF
                </button>
              </div>
            </div>

            {/* Laporan Per Bulan */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {filteredData.map((row, idx) => {
                const totalPemasukan = row.penjualan + row.pendapatanLain;
                const totalPengeluaran = row.pengeluaranOperasional + row.gajiPegawai + row.pengeluaranLain;
                const labaKotor = totalPemasukan - totalPengeluaran;
                const labaBersih = labaKotor - row.piutang;
                const uangBersih = row.modal + labaBersih;
                
                return (
                  <div key={idx} className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
                    <div className="text-center mb-4">
                      <h2 className="text-xl font-bold text-gray-800 mb-1">LAPORAN KEUANGAN</h2>
                      <p className="text-lg font-semibold text-jade-600">{row.bulan} {row.tahun}</p>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Pemasukan */}
                      <div className="border-b border-gray-200 pb-3">
                        <h3 className="font-bold text-gray-700 mb-2 text-sm uppercase tracking-wide">PEMASUKAN</h3>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Modal Awal:</span>
                            <span className="font-semibold">{formatRupiah(row.modal)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Penjualan:</span>
                            <span className="font-semibold">{formatRupiah(row.penjualan)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Pendapatan Lain:</span>
                            <span className="font-semibold">{formatRupiah(row.pendapatanLain)}</span>
                          </div>
                          <div className="flex justify-between border-t border-gray-100 pt-1 font-bold text-green-600">
                            <span>Total Pemasukan:</span>
                            <span>{formatRupiah(totalPemasukan)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Pengeluaran */}
                      <div className="border-b border-gray-200 pb-3">
                        <h3 className="font-bold text-gray-700 mb-2 text-sm uppercase tracking-wide">PENGELUARAN</h3>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Operasional:</span>
                            <span className="font-semibold">{formatRupiah(row.pengeluaranOperasional)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Gaji Pegawai:</span>
                            <span className="font-semibold">{formatRupiah(row.gajiPegawai)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Pengeluaran Lain:</span>
                            <span className="font-semibold">{formatRupiah(row.pengeluaranLain)}</span>
                          </div>
                          <div className="flex justify-between border-t border-gray-100 pt-1 font-bold text-red-600">
                            <span>Total Pengeluaran:</span>
                            <span>{formatRupiah(totalPengeluaran)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Hasil */}
                      <div>
                        <h3 className="font-bold text-gray-700 mb-2 text-sm uppercase tracking-wide">HASIL</h3>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Laba Kotor:</span>
                            <span className={`font-semibold ${labaKotor >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatRupiah(labaKotor)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Piutang:</span>
                            <span className="font-semibold text-yellow-600">{formatRupiah(row.piutang)}</span>
                          </div>
                          <div className="flex justify-between border-t border-gray-200 pt-1">
                            <span className="font-bold">Laba Bersih:</span>
                            <span className={`font-bold text-lg ${labaBersih >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatRupiah(labaBersih)}
                            </span>
                          </div>
                          <div className="flex justify-between border-t border-gray-200 pt-1">
                            <span className="font-bold">Uang Bersih:</span>
                            <span className="font-bold text-lg text-blue-600">{formatRupiah(uangBersih)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Grafik */}
            {/* <div className="mb-8 bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold mb-4 text-gray-700">Grafik Laba Kotor & Laba Bersih</h2>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bulan" />
                  <YAxis tickFormatter={formatRupiah} />
                  <Tooltip formatter={value => formatRupiah(value)} />
                  <Legend />
                  <Bar dataKey="Laba Kotor" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Laba Bersih" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mb-8 bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold mb-4 text-gray-700">Grafik Pemasukan & Pengeluaran</h2>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartPemasukanPengeluaran} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bulan" />
                  <YAxis tickFormatter={formatRupiah} />
                  <Tooltip formatter={value => formatRupiah(value)} />
                  <Legend />
                  <Bar dataKey="Total Pemasukan" fill="#4ade80" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Total Pengeluaran" fill="#f87171" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mb-8 bg-blue-50 border border-blue-200 rounded p-6 text-blue-900 font-bold text-lg flex items-center gap-4">
              <span>Saldo Akhir Tahun {tahun}:</span>
              <span className="text-2xl">{formatRupiah(saldoAkhirTahun)}</span>
            </div>

            <div className="mt-8 text-gray-600 text-xs">
              <ul className="list-disc ml-6">
                <li><b>Modal Awal</b>: Uang awal yang dimiliki di bulan tersebut.</li>
                <li><b>Penjualan</b>: Total pemasukan dari penjualan produk.</li>
                <li><b>Pendapatan Lain</b>: Pemasukan di luar penjualan (misal: sewa, cashback, dll).</li>
                <li><b>Total Pemasukan</b>: Penjualan + Pendapatan Lain.</li>
                <li><b>Operasional</b>: Biaya operasional (beli barang, listrik, air, dll).</li>
                <li><b>Gaji Pegawai</b>: Biaya gaji karyawan.</li>
                <li><b>Pengeluaran Lain</b>: Pengeluaran di luar operasional dan gaji.</li>
                <li><b>Total Pengeluaran</b>: Operasional + Gaji Pegawai + Pengeluaran Lain.</li>
                <li><b>Laba Kotor</b>: Total Pemasukan - Total Pengeluaran.</li>
                <li><b>Piutang</b>: Total tagihan pelanggan yang belum lunas.</li>
                <li><b>Laba Bersih</b>: Laba Kotor - Piutang.</li>
                <li><b>Uang Bersih</b>: Modal Awal + Laba Bersih.</li>
                <li><b>Saldo Akhir Tahun</b>: Akumulasi uang bersih seluruh bulan dalam tahun tersebut.</li>
              </ul>
            </div> */}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Keuangan;
