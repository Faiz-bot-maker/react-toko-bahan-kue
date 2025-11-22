//keuangan
import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const getHeaders = () => ({
  Authorization: localStorage.getItem("authToken"),
  "ngrok-skip-browser-warning": "true",
});

const API_URL_BALANCE = `${process.env.REACT_APP_API_URL}/finance-report/balance-sheet`;
const API_URL_CASHFLOW = `${process.env.REACT_APP_API_URL}/finance-report/cashflow`;
const API_URL_SUMMARY = `${process.env.REACT_APP_API_URL}/finance-report/summary`;

const OwnerKeuangan = () => {
  const [balanceSheet, setBalanceSheet] = useState(null);
  const [summary, setSummary] = useState(null);
  const [cashFlow, setCashFlow] = useState(null);

  // Filters
  const [selectedDate, setSelectedDate] = useState(null);

  const [cashFlowRange, setCashFlowRange] = useState([null, null]);
  const [startDate, endDate] = cashFlowRange;

  const [summaryRange, setSummaryRange] = useState([null, null]);
  const [summaryStart, summaryEnd] = summaryRange;

  // ========================
  // FETCH FUNCTIONS
  // ========================

  const fetchBalanceSheet = async () => {
    try {
      const params = {};

      if (selectedDate) {
        params.as_of = selectedDate.toISOString().split("T")[0];
      }

      const res = await axios.get(API_URL_BALANCE, {
        headers: getHeaders(),
        params,
      });
      setBalanceSheet(res.data.data);
    } catch (err) {
      console.error("Error fetch balance sheet:", err);
    }
  };

  const fetchCashFlow = async () => {
    try {
      const params = {};

      if (startDate && endDate) {
        params.start_at = startDate.toISOString().split("T")[0];
        params.end_at = endDate.toISOString().split("T")[0];
      }

      const res = await axios.get(API_URL_CASHFLOW, {
        headers: getHeaders(),
        params,
      });
      setCashFlow(res.data.data);
    } catch (err) {
      console.error("Error fetch cash flow:", err);
    }
  };

  const fetchSummary = async () => {
    try {
      const params = {};

      if (summaryStart && summaryEnd) {
        params.start_at = summaryStart.toISOString().split("T")[0];
        params.end_at = summaryEnd.toISOString().split("T")[0];
      }

      const res = await axios.get(API_URL_SUMMARY, {
        headers: getHeaders(),
        params,
      });
      setSummary(res.data.data);
    } catch (err) {
      console.error("Error fetch summary:", err);
    }
  };

  // Load first time
  useEffect(() => {
    fetchBalanceSheet();
    fetchCashFlow();
    fetchSummary();
  }, []);

  // ========================
  // EXPORT EXCEL
  // ========================
  const exportAllToExcel = () => {
    if (!balanceSheet || !cashFlow || !summary) return;

    const wb = XLSX.utils.book_new();

    const balanceData = [
      ["Aktiva", "Nominal", "Kewajiban & Ekuitas", "Nominal"],
      ["Kas & Bank", balanceSheet.assets.cash_and_bank, "Hutang Usaha", balanceSheet.liabilities.accounts_payable],
      ["Piutang Usaha", balanceSheet.assets.accounts_receivable, "Total Kewajiban Lancar", balanceSheet.liabilities.total_current_liabilities],
      ["Persediaan", balanceSheet.assets.inventory, "Modal Pemilik", balanceSheet.equity.owner_capital],
      ["", "", "Laba Ditahan", balanceSheet.equity.retained_earnings],
      ["Total Aktiva Lancar", balanceSheet.assets.total_current_assets, "Total Ekuitas", balanceSheet.equity.total_equity],
      ["Total Aktiva", balanceSheet.balance.total_assets, "Kewajiban + Ekuitas", balanceSheet.balance.liabilities_plus_equity],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(balanceData), "Neraca");

    const cashData = [
      ["Item", "Nominal"],
      ["Penerimaan Kas", cashFlow.cash_in],
      ["Pengeluaran Kas", cashFlow.cash_out],
      ["Saldo Akhir", cashFlow.balance],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(cashData), "Arus Kas");

    const summaryData = [
      ["Item", "Nominal"],
      ["Total Penjualan", summary.total_sales],
      ["Total HPP", summary.total_hpp],
      ["Total Biaya", summary.total_expenses],
      ["Laba Bersih", summary.net_profit],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryData), "Ringkasan");

    const branchData = [
      ["Cabang", "Penjualan", "HPP", "Biaya", "Laba Bersih"],
      ...summary.by_branch.map((b) => [b.branch_name, b.sales, b.hpp, b.expenses, b.net_profit]),
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(branchData), "Per Cabang");

    XLSX.writeFile(wb, "LaporanKeuangan.xlsx");
  };

  // ========================
  // EXPORT PDF
  // ========================
  const exportAllToPDF = () => {
    if (!balanceSheet || !cashFlow || !summary) return;

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("LAPORAN NERACA", 105, 15, { align: "center" });

    autoTable(doc, {
      startY: 30,
      head: [["Aktiva", "Nominal", "Kewajiban & Ekuitas", "Nominal"]],
      body: [
        ["Kas & Bank", balanceSheet.assets.cash_and_bank.toLocaleString("id-ID"), "Hutang Usaha", balanceSheet.liabilities.accounts_payable.toLocaleString("id-ID")],
        ["Piutang Usaha", balanceSheet.assets.accounts_receivable.toLocaleString("id-ID"), "Total Kewajiban Lancar", balanceSheet.liabilities.total_current_liabilities.toLocaleString("id-ID")],
        ["Persediaan", balanceSheet.assets.inventory.toLocaleString("id-ID"), "Modal Pemilik", balanceSheet.equity.owner_capital.toLocaleString("id-ID")],
        ["", "", "Laba Ditahan", balanceSheet.equity.retained_earnings.toLocaleString("id-ID")],
        ["Total Aktiva Lancar", balanceSheet.assets.total_current_assets.toLocaleString("id-ID"), "Total Ekuitas", balanceSheet.equity.total_equity.toLocaleString("id-ID")],
        ["Total Aktiva", balanceSheet.balance.total_assets.toLocaleString("id-ID"), "Kewajiban + Ekuitas", balanceSheet.balance.liabilities_plus_equity.toLocaleString("id-ID")],
      ],
      theme: "grid",
    });

    doc.addPage();
    doc.setFontSize(16);
    doc.text("LAPORAN ARUS KAS", 105, 15, { align: "center" });

    autoTable(doc, {
      startY: 30,
      head: [["Item", "Nominal"]],
      body: [
        ["Penerimaan Kas", cashFlow.cash_in.toLocaleString("id-ID")],
        ["Pengeluaran Kas", cashFlow.cash_out.toLocaleString("id-ID")],
        ["Saldo Akhir", cashFlow.balance.toLocaleString("id-ID")],
      ],
      theme: "grid",
    });

    doc.addPage();
    doc.setFontSize(16);
    doc.text("RINGKASAN LABA RUGI", 105, 15, { align: "center" });

    autoTable(doc, {
      startY: 30,
      head: [["Item", "Nominal"]],
      body: [
        ["Total Penjualan", summary.total_sales.toLocaleString("id-ID")],
        ["Total HPP", summary.total_hpp.toLocaleString("id-ID")],
        ["Total Biaya", summary.total_expenses.toLocaleString("id-ID")],
        ["Laba Bersih", summary.net_profit.toLocaleString("id-ID")],
      ],
      theme: "grid",
    });

    doc.save("LaporanKeuangan.pdf");
  };

  return (
    <Layout>
      <div className="p-6 space-y-10">

        {/* HEADER: Judul kiri + export kanan */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">📊 Laporan Keuangan</h1>

          <div className="flex gap-3">
            <button
              onClick={exportAllToExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
            >
              Export Excel
            </button>

            <button
              onClick={exportAllToPDF}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow"
            >
              Export PDF
            </button>
          </div>
        </div>

        {/* =================================================== */}
        {/* ===================== NERACA ======================= */}
        {/* =================================================== */}

        <section>
          <h2 className="text-xl font-bold mb-2 bg-gray-700 text-white px-3 py-2 rounded">
            Laporan Neraca
          </h2>

          <div className="mb-4 flex items-center gap-2">

            <label className="font-medium">Pilih Tanggal:</label>

            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              isClearable
              dateFormat="dd/MM/yyyy"
              className="border px-3 py-1 rounded"
            />

            <button
              onClick={fetchBalanceSheet}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded"
            >
              Terapkan
            </button>

            <button
              onClick={() => {
                setSelectedDate(null);
                setBalanceSheet(null);
                setTimeout(() => fetchBalanceSheet(), 10);
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-1 rounded"
            >
              Reset
            </button>
          </div>

          {!balanceSheet ? (
            <p>Sedang memuat neraca...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border text-sm">
                <thead className="bg-gray-700 text-white">
                  <tr>
                    <th className="border px-4 py-2 text-left">Aktiva</th>
                    <th className="border px-4 py-2 text-right">Nominal</th>
                    <th className="border px-4 py-2 text-left">Kewajiban & Ekuitas</th>
                    <th className="border px-4 py-2 text-right">Nominal</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td className="border px-4 py-2">Kas & Bank</td>
                    <td className="border px-4 py-2 text-right">
                      {balanceSheet.assets.cash_and_bank.toLocaleString("id-ID")}
                    </td>
                    <td className="border px-4 py-2">Hutang Usaha</td>
                    <td className="border px-4 py-2 text-right">
                      {balanceSheet.liabilities.accounts_payable.toLocaleString("id-ID")}
                    </td>
                  </tr>

                  <tr>
                    <td className="border px-4 py-2">Piutang Usaha</td>
                    <td className="border px-4 py-2 text-right">
                      {balanceSheet.assets.accounts_receivable.toLocaleString("id-ID")}
                    </td>
                    <td className="border px-4 py-2">Total Kewajiban Lancar</td>
                    <td className="border px-4 py-2 text-right">
                      {balanceSheet.liabilities.total_current_liabilities.toLocaleString("id-ID")}
                    </td>
                  </tr>

                  <tr>
                    <td className="border px-4 py-2">Persediaan</td>
                    <td className="border px-4 py-2 text-right">
                      {balanceSheet.assets.inventory.toLocaleString("id-ID")}
                    </td>
                    <td className="border px-4 py-2">Modal Pemilik</td>
                    <td className="border px-4 py-2 text-right">
                      {balanceSheet.equity.owner_capital.toLocaleString("id-ID")}
                    </td>
                  </tr>

                  <tr>
                    <td className="border px-4 py-2"></td>
                    <td className="border px-4 py-2"></td>
                    <td className="border px-4 py-2">Laba Ditahan</td>
                    <td className="border px-4 py-2 text-right">
                      {balanceSheet.equity.retained_earnings.toLocaleString("id-ID")}
                    </td>
                  </tr>

                  <tr className="bg-gray-50 font-bold">
                    <td className="border px-4 py-2">Total Aktiva Lancar</td>
                    <td className="border px-4 py-2 text-right">
                      {balanceSheet.assets.total_current_assets.toLocaleString("id-ID")}
                    </td>
                    <td className="border px-4 py-2">Total Ekuitas</td>
                    <td className="border px-4 py-2 text-right">
                      {balanceSheet.equity.total_equity.toLocaleString("id-ID")}
                    </td>
                  </tr>

                  <tr className="bg-gray-200 font-bold">
                    <td className="border px-4 py-2">Total Aktiva</td>
                    <td className="border px-4 py-2 text-right">
                      {balanceSheet.balance.total_assets.toLocaleString("id-ID")}
                    </td>
                    <td className="border px-4 py-2">Kewajiban + Ekuitas</td>
                    <td className="border px-4 py-2 text-right">
                      {balanceSheet.balance.liabilities_plus_equity.toLocaleString("id-ID")}
                    </td>
                  </tr>
                </tbody>

              </table>
            </div>
          )}
        </section>

        {/* =================================================== */}
        {/* ================== ARUS KAS ======================== */}
        {/* =================================================== */}

        <section>
          <h2 className="text-xl font-bold mb-2 bg-gray-700 text-white px-3 py-2 rounded">
            Laporan Arus Kas
          </h2>

          <div className="mb-4 flex items-center gap-2">

            <label className="font-medium">Pilih Periode:</label>

            <DatePicker
              selectsRange
              startDate={cashFlowRange[0]}
              endDate={cashFlowRange[1]}
              onChange={(update) => setCashFlowRange(update)}
              isClearable
              dateFormat="dd/MM/yyyy"
              className="border px-3 py-1 rounded"
            />

            <button
              onClick={fetchCashFlow}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded"
            >
              Terapkan
            </button>

            <button
              onClick={() => {
                setCashFlowRange([null, null]);
                setCashFlow(null);
                setTimeout(() => fetchCashFlow(), 10);
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-1 rounded"
            >
              Reset
            </button>
          </div>

          {cashFlow ? (
            <div className="overflow-x-auto">
              <table className="w-full border text-sm">
                <thead className="bg-gray-700 text-white">
                  <tr>
                    <th className="border px-4 py-2 text-left">Item</th>
                    <th className="border px-4 py-2 text-right">Nominal</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td className="border px-4 py-2">Penerimaan Kas</td>
                    <td className="border px-4 py-2 text-right">
                      {cashFlow.cash_in.toLocaleString("id-ID")}
                    </td>
                  </tr>

                  <tr>
                    <td className="border px-4 py-2">Pengeluaran Kas</td>
                    <td className="border px-4 py-2 text-right">
                      {cashFlow.cash_out.toLocaleString("id-ID")}
                    </td>
                  </tr>

                  <tr className="bg-gray-50 font-bold">
                    <td className="border px-4 py-2">Saldo Akhir</td>
                    <td className="border px-4 py-2 text-right">
                      {cashFlow.balance.toLocaleString("id-ID")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <p>Pilih periode terlebih dahulu...</p>
          )}
        </section>

        {/* =================================================== */}
        {/* ================= UANG CABANG ====================== */}
        {/* =================================================== */}

        <section>
          <h2 className="text-xl font-bold mb-2 bg-gray-700 text-white px-3 py-2 rounded">
            Laporan Uang Cabang
          </h2>

          <div className="mb-4 flex items-center gap-2">

            <label className="font-medium">Pilih Periode:</label>

            <DatePicker
              selectsRange
              startDate={summaryRange[0]}
              endDate={summaryRange[1]}
              onChange={(update) => setSummaryRange(update)}
              dateFormat="dd/MM/yyyy"
              isClearable
              className="border px-3 py-1 rounded"
            />

            <button
              onClick={fetchSummary}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded"
            >
              Terapkan
            </button>

            <button
              onClick={() => {
                setSummaryRange([null, null]);
                setSummary(null);
                setTimeout(() => fetchSummary(), 10);
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-1 rounded"
            >
              Reset
            </button>
          </div>

          {summary ? (
            <div className="overflow-x-auto">

              <table className="w-full border text-sm mb-6">
                <thead className="bg-gray-700 text-white">
                  <tr>
                    <th className="border px-4 py-2 text-left">Item</th>
                    <th className="border px-4 py-2 text-right">Nominal</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td className="border px-4 py-2">Total Penjualan</td>
                    <td className="border px-4 py-2 text-right">
                      {summary.total_sales.toLocaleString("id-ID")}
                    </td>
                  </tr>

                  <tr>
                    <td className="border px-4 py-2">Total HPP</td>
                    <td className="border px-4 py-2 text-right">
                      {summary.total_hpp.toLocaleString("id-ID")}
                    </td>
                  </tr>

                  <tr>
                    <td className="border px-4 py-2">Total Biaya</td>
                    <td className="border px-4 py-2 text-right">
                      {summary.total_expenses.toLocaleString("id-ID")}
                    </td>
                  </tr>

                  <tr className="bg-gray-50 font-bold">
                    <td className="border px-4 py-2">Laba Bersih</td>
                    <td className="border px-4 py-2 text-right">
                      {summary.net_profit.toLocaleString("id-ID")}
                    </td>
                  </tr>
                </tbody>
              </table>

              <h3 className="text-lg font-semibold mb-2 bg-gray-700 text-white px-3 py-2 rounded">
                Detail Per Cabang
              </h3>

              <table className="w-full border text-sm">
                <thead className="bg-gray-700 text-white">
                  <tr>
                    <th className="border px-4 py-2 text-left">Cabang</th>
                    <th className="border px-4 py-2 text-right">Penjualan</th>
                    <th className="border px-4 py-2 text-right">HPP</th>
                    <th className="border px-4 py-2 text-right">Biaya</th>
                    <th className="border px-4 py-2 text-right">Laba Bersih</th>
                  </tr>
                </thead>

                <tbody>
                  {summary.by_branch.map((b, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="border px-4 py-2">{b.branch_name}</td>
                      <td className="border px-4 py-2 text-right">{b.sales.toLocaleString("id-ID")}</td>
                      <td className="border px-4 py-2 text-right">{b.hpp.toLocaleString("id-ID")}</td>
                      <td className="border px-4 py-2 text-right">{b.expenses.toLocaleString("id-ID")}</td>
                      <td className="border px-4 py-2 text-right font-bold">{b.net_profit.toLocaleString("id-ID")}</td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          ) : (
            <p>Sedang memuat laporan...</p>
          )}
        </section>

      </div>
    </Layout>
  );
};

export default OwnerKeuangan;
