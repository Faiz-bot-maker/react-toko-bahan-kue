import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const getHeaders = () => ({
  Authorization: localStorage.getItem("authToken"),
  "ngrok-skip-browser-warning": "true",
});

const API_URL = `${process.env.REACT_APP_API_URL}/keuangan`; 

const OwnerKeuangan = () => {
  const [data, setData] = useState([]);

  // Fetch data keuangan
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(API_URL, { headers: getHeaders() });
        setData(res.data);
      } catch (err) {
        console.error("Error fetch data keuangan:", err);
      }
    };
    fetchData();
  }, []);

  // Export ke Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Keuangan");
    XLSX.writeFile(workbook, "Keuangan.xlsx");
  };

  // Export ke PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Laporan Keuangan", 14, 10);
    doc.autoTable({
      startY: 20,
      head: [["Tanggal", "Jenis", "Deskripsi", "Nominal"]],
      body: data.map((item) => [
        item.tanggal,
        item.jenis,
        item.deskripsi,
        `Rp ${item.nominal.toLocaleString("id-ID")}`,
      ]),
    });
    doc.save("Keuangan.pdf");
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Data Keuangan</h1>

          <div className="flex gap-2 mb-4">
            <button
              onClick={exportToExcel}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Export Excel
            </button>
            <button
              onClick={exportToPDF}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Export PDF
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2">Tanggal</th>
                  <th className="border px-4 py-2">Jenis</th>
                  <th className="border px-4 py-2">Deskripsi</th>
                  <th className="border px-4 py-2">Nominal</th>
                </tr>
              </thead>
              <tbody>
                {data.length > 0 ? (
                  data.map((item, index) => (
                    <tr key={index}>
                      <td className="border px-4 py-2">{item.tanggal}</td>
                      <td className="border px-4 py-2">{item.jenis}</td>
                      <td className="border px-4 py-2">{item.deskripsi}</td>
                      <td className="border px-4 py-2">
                        Rp {item.nominal.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-4">
                      Tidak ada data keuangan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerKeuangan;