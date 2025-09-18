import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


const getHeaders = () => ( {
  Authorization: localStorage.getItem( "authToken" ),
  "ngrok-skip-browser-warning": "true",
} );

const API_URL_BALANCE = `${process.env.REACT_APP_API_URL}/finance-report/balance-sheet`;
const API_URL_CASHFLOW = `${process.env.REACT_APP_API_URL}/finance-report/cashflow`;
const API_URL_SUMMARY = `${process.env.REACT_APP_API_URL}/finance-report/summary`;

const OwnerKeuangan = () => {
  const [ balanceSheet, setBalanceSheet ] = useState( null );
  const [ cashFlow, setCashFlow ] = useState( null );
  const [ summary, setSummary ] = useState( null );

  // Fetch Balance Sheet
  useEffect( () => {
    const fetchBalanceSheet = async () => {
      try {
        const res = await axios.get( API_URL_BALANCE, { headers: getHeaders() } );
        setBalanceSheet( res.data.data );
      } catch ( err ) {
        console.error( "Error fetch balance sheet:", err );
      }
    };
    fetchBalanceSheet();
  }, [] );

  // Fetch Cash Flow
  useEffect( () => {
    const fetchCashFlow = async () => {
      try {
        const res = await axios.get( API_URL_CASHFLOW, { headers: getHeaders() } );
        setCashFlow( res.data.data );
      } catch ( err ) {
        console.error( "Error fetch cash flow:", err );
      }
    };
    fetchCashFlow();
  }, [] );

  // Fetch Summary
  useEffect( () => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get( API_URL_SUMMARY, { headers: getHeaders() } );
        setSummary( res.data.data );
      } catch ( err ) {
        console.error( "Error fetch summary:", err );
      }
    };
    fetchSummary();
  }, [] );

  // Export Excel
  const exportAllToExcel = () => {
    if ( !balanceSheet || !cashFlow || !summary ) return;

    const wb = XLSX.utils.book_new();

    // Neraca
    const balanceData = [
      [ "Aktiva", "Nominal", "Kewajiban & Ekuitas", "Nominal" ],
      [
        "Kas & Bank",
        balanceSheet.assets.cash_and_bank,
        "Hutang Usaha",
        balanceSheet.liabilities.accounts_payable,
      ],
      [
        "Piutang Usaha",
        balanceSheet.assets.accounts_receivable,
        "Total Kewajiban Lancar",
        balanceSheet.liabilities.total_current_liabilities,
      ],
      [
        "Persediaan",
        balanceSheet.assets.inventory,
        "Modal Pemilik",
        balanceSheet.equity.owner_capital,
      ],
      [ "", "", "Laba Ditahan", balanceSheet.equity.retained_earnings ],
      [
        "Total Aktiva Lancar",
        balanceSheet.assets.total_current_assets,
        "Total Ekuitas",
        balanceSheet.equity.total_equity,
      ],
      [
        "Total Aktiva",
        balanceSheet.balance.total_assets,
        "Kewajiban + Ekuitas",
        balanceSheet.balance.liabilities_plus_equity,
      ],
    ];
    const wsBalance = XLSX.utils.aoa_to_sheet( balanceData );
    XLSX.utils.book_append_sheet( wb, wsBalance, "Neraca" );

    // Cash Flow
    const cashData = [
      [ "Item", "Nominal" ],
      [ "Penerimaan Kas", cashFlow.cash_in ],
      [ "Pengeluaran Kas", cashFlow.cash_out ],
      [ "Saldo Akhir", cashFlow.balance ],
    ];
    const wsCash = XLSX.utils.aoa_to_sheet( cashData );
    XLSX.utils.book_append_sheet( wb, wsCash, "Arus Kas" );

    // Summary
    const summaryData = [
      [ "Item", "Nominal" ],
      [ "Total Penjualan", summary.total_sales ],
      [ "Total HPP", summary.total_hpp ],
      [ "Total Biaya", summary.total_expenses ],
      [ "Laba Bersih", summary.net_profit ],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet( summaryData );
    XLSX.utils.book_append_sheet( wb, wsSummary, "Ringkasan" );

    const branchData = [
      [ "Cabang", "Penjualan", "HPP", "Biaya", "Laba Bersih" ],
      ...summary.by_branch.map( ( b ) => [
        b.branch_name,
        b.sales,
        b.hpp,
        b.expenses,
        b.net_profit,
      ] ),
    ];
    const wsBranch = XLSX.utils.aoa_to_sheet( branchData );
    XLSX.utils.book_append_sheet( wb, wsBranch, "Per Cabang" );

    XLSX.writeFile( wb, "LaporanKeuangan.xlsx" );
  };

  // Export PDF
  const exportAllToPDF = () => {
    if ( !balanceSheet || !cashFlow || !summary ) return;

    const doc = new jsPDF();

    // ====== Neraca ======
    doc.setFontSize( 16 );
    doc.text( "LAPORAN NERACA", 105, 15, { align: "center" } );
    doc.setFontSize( 10 );
    doc.text( `Per ${balanceSheet.as_of}`, 105, 22, { align: "center" } );

    autoTable( doc, {
      startY: 30,
      head: [ [ "Aktiva", "Nominal", "Kewajiban & Ekuitas", "Nominal" ] ],
      body: [
        [
          "Kas & Bank",
          balanceSheet.assets.cash_and_bank.toLocaleString( "id-ID" ),
          "Hutang Usaha",
          balanceSheet.liabilities.accounts_payable.toLocaleString( "id-ID" ),
        ],
        [
          "Piutang Usaha",
          balanceSheet.assets.accounts_receivable.toLocaleString( "id-ID" ),
          "Total Kewajiban Lancar",
          balanceSheet.liabilities.total_current_liabilities.toLocaleString(
            "id-ID"
          ),
        ],
        [
          "Persediaan",
          balanceSheet.assets.inventory.toLocaleString( "id-ID" ),
          "Modal Pemilik",
          balanceSheet.equity.owner_capital.toLocaleString( "id-ID" ),
        ],
        [ "", "", "Laba Ditahan", balanceSheet.equity.retained_earnings.toLocaleString( "id-ID" ) ],
        [
          "Total Aktiva Lancar",
          balanceSheet.assets.total_current_assets.toLocaleString( "id-ID" ),
          "Total Ekuitas",
          balanceSheet.equity.total_equity.toLocaleString( "id-ID" ),
        ],
        [
          "Total Aktiva",
          balanceSheet.balance.total_assets.toLocaleString( "id-ID" ),
          "Kewajiban + Ekuitas",
          balanceSheet.balance.liabilities_plus_equity.toLocaleString( "id-ID" ),
        ],
      ],
      styles: { halign: "right" },
      columnStyles: { 0: { halign: "left" }, 2: { halign: "left" } },
      headStyles: { fillColor: [ 55, 71, 79 ], textColor: [ 255, 255, 255 ], halign: "center" },
      theme: "grid",
    } );

    // ====== Arus Kas ======
    doc.addPage();
    doc.setFontSize( 16 );
    doc.text( "LAPORAN ARUS KAS", 105, 15, { align: "center" } );
    doc.setFontSize( 10 );
    doc.text( `Periode: ${cashFlow.period}`, 105, 22, { align: "center" } );

    autoTable( doc, {
      startY: 30,
      head: [ [ "Item", "Nominal" ] ],
      body: [
        [ "Penerimaan Kas", cashFlow.cash_in.toLocaleString( "id-ID" ) ],
        [ "Pengeluaran Kas", cashFlow.cash_out.toLocaleString( "id-ID" ) ],
        [ "Saldo Akhir", cashFlow.balance.toLocaleString( "id-ID" ) ],
      ],
      styles: { halign: "right" },
      columnStyles: { 0: { halign: "left" } },
      headStyles: { fillColor: [ 55, 71, 79 ], textColor: [ 255, 255, 255 ] },
      theme: "grid",
    } );

    // ====== Ringkasan ======
    doc.addPage();
    doc.setFontSize( 16 );
    doc.text( "LAPORAN LABA RUGI & RINGKASAN", 105, 15, { align: "center" } );
    doc.setFontSize( 10 );
    doc.text( `Periode: ${summary.period}`, 105, 22, { align: "center" } );

    autoTable( doc, {
      startY: 30,
      head: [ [ "Item", "Nominal" ] ],
      body: [
        [ "Total Penjualan", summary.total_sales.toLocaleString( "id-ID" ) ],
        [ "Total HPP", summary.total_hpp.toLocaleString( "id-ID" ) ],
        [ "Total Biaya", summary.total_expenses.toLocaleString( "id-ID" ) ],
        [ "Laba Bersih", summary.net_profit.toLocaleString( "id-ID" ) ],
      ],
      styles: { halign: "right" },
      columnStyles: { 0: { halign: "left" } },
      headStyles: { fillColor: [ 55, 71, 79 ], textColor: [ 255, 255, 255 ] },
      theme: "grid",
    } );

    doc.setFontSize( 12 );
    doc.text( "Detail Per Cabang", 14, doc.lastAutoTable.finalY + 10 );

    autoTable( doc, {
      startY: doc.lastAutoTable.finalY + 15,
      head: [ [ "Cabang", "Penjualan", "HPP", "Biaya", "Laba Bersih" ] ],
      body: summary.by_branch.map( ( b ) => [
        b.branch_name,
        b.sales.toLocaleString( "id-ID" ),
        b.hpp.toLocaleString( "id-ID" ),
        b.expenses.toLocaleString( "id-ID" ),
        b.net_profit.toLocaleString( "id-ID" ),
      ] ),
      styles: { halign: "right" },
      columnStyles: { 0: { halign: "left" } },
      headStyles: { fillColor: [ 55, 71, 79 ], textColor: [ 255, 255, 255 ] },
      theme: "grid",
    } );

    doc.save( "LaporanKeuangan.pdf" );
  };

  return (
    <Layout>
      <div className="p-6 space-y-10">
        <h1 className="text-2xl font-bold text-center mb-8">
          📊 Laporan Keuangan
        </h1>

        {/* Tombol Export */ }
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={ exportAllToExcel }
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
          >
            Export ke Excel
          </button>
          <button
            onClick={ exportAllToPDF }
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow"
          >
            Export ke PDF
          </button>
        </div>

        {/* Ringkasan 3 Card */ }
        { summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white border rounded-xl shadow p-6">
              <h3 className="text-sm font-semibold text-gray-600">
                Total Penjualan
              </h3>
              <p className="text-2xl font-bold text-green-600 mt-2">
                Rp { summary.total_sales.toLocaleString( "id-ID" ) }
              </p>
            </div>
            <div className="bg-white border rounded-xl shadow p-6">
              <h3 className="text-sm font-semibold text-gray-600">Total Biaya</h3>
              <p className="text-2xl font-bold text-red-600 mt-2">
                Rp { summary.total_expenses.toLocaleString( "id-ID" ) }
              </p>
            </div>
            <div className="bg-white border rounded-xl shadow p-6">
              <h3 className="text-sm font-semibold text-gray-600">Laba Bersih</h3>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                Rp { summary.net_profit.toLocaleString( "id-ID" ) }
              </p>
            </div>
          </div>
        ) }

        {/* Neraca */ }
        <section>
          <h2 className="text-xl font-bold mb-2 bg-gray-700 text-white px-3 py-2 rounded">
            Laporan Neraca
          </h2>
          { balanceSheet ? (
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300 text-sm">
                <thead className="bg-gray-700 text-white">
                  <tr>
                    <th className="border px-4 py-2 text-left w-1/4">Aktiva</th>
                    <th className="border px-4 py-2 text-right w-1/4">Nominal</th>
                    <th className="border px-4 py-2 text-left w-1/4">
                      Kewajiban & Ekuitas
                    </th>
                    <th className="border px-4 py-2 text-right w-1/4">Nominal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-4 py-2">Kas & Bank</td>
                    <td className="border px-4 py-2 text-right">
                      { balanceSheet.assets.cash_and_bank.toLocaleString( "id-ID" ) }
                    </td>
                    <td className="border px-4 py-2">Hutang Usaha</td>
                    <td className="border px-4 py-2 text-right">
                      { balanceSheet.liabilities.accounts_payable.toLocaleString(
                        "id-ID"
                      ) }
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2">Piutang Usaha</td>
                    <td className="border px-4 py-2 text-right">
                      { balanceSheet.assets.accounts_receivable.toLocaleString(
                        "id-ID"
                      ) }
                    </td>
                    <td className="border px-4 py-2">Total Kewajiban Lancar</td>
                    <td className="border px-4 py-2 text-right">
                      { balanceSheet.liabilities.total_current_liabilities.toLocaleString(
                        "id-ID"
                      ) }
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2">Persediaan</td>
                    <td className="border px-4 py-2 text-right">
                      { balanceSheet.assets.inventory.toLocaleString( "id-ID" ) }
                    </td>
                    <td className="border px-4 py-2">Modal Pemilik</td>
                    <td className="border px-4 py-2 text-right">
                      { balanceSheet.equity.owner_capital.toLocaleString( "id-ID" ) }
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2"></td>
                    <td className="border px-4 py-2"></td>
                    <td className="border px-4 py-2">Laba Ditahan</td>
                    <td className="border px-4 py-2 text-right">
                      { balanceSheet.equity.retained_earnings.toLocaleString(
                        "id-ID"
                      ) }
                    </td>
                  </tr>
                  <tr className="bg-gray-50 font-bold">
                    <td className="border px-4 py-2">Total Aktiva Lancar</td>
                    <td className="border px-4 py-2 text-right">
                      { balanceSheet.assets.total_current_assets.toLocaleString(
                        "id-ID"
                      ) }
                    </td>
                    <td className="border px-4 py-2">Total Ekuitas</td>
                    <td className="border px-4 py-2 text-right">
                      { balanceSheet.equity.total_equity.toLocaleString( "id-ID" ) }
                    </td>
                  </tr>
                  <tr className="bg-gray-200 font-bold">
                    <td className="border px-4 py-2">Total Aktiva</td>
                    <td className="border px-4 py-2 text-right">
                      { balanceSheet.balance.total_assets.toLocaleString( "id-ID" ) }
                    </td>
                    <td className="border px-4 py-2">Kewajiban + Ekuitas</td>
                    <td className="border px-4 py-2 text-right">
                      { balanceSheet.balance.liabilities_plus_equity.toLocaleString(
                        "id-ID"
                      ) }
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <p>Sedang memuat Laporan Neraca...</p>
          ) }
        </section>

        {/* Arus Kas */ }
        <section>
          <h2 className="text-xl font-bold mb-2 bg-gray-700 text-white px-3 py-2 rounded">
            Laporan Arus Kas
          </h2>
          { cashFlow ? (
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300 text-sm">
                <thead className="bg-gray-700 text-white">
                  <tr>
                    <th className="border px-4 py-2 text-left w-1/2">Item</th>
                    <th className="border px-4 py-2 text-right w-1/2">Nominal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-4 py-2">Penerimaan Kas</td>
                    <td className="border px-4 py-2 text-right">
                      { cashFlow.cash_in.toLocaleString( "id-ID" ) }
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2">Pengeluaran Kas</td>
                    <td className="border px-4 py-2 text-right">
                      { cashFlow.cash_out.toLocaleString( "id-ID" ) }
                    </td>
                  </tr>
                  <tr className="bg-gray-50 font-bold">
                    <td className="border px-4 py-2">Saldo Akhir</td>
                    <td className="border px-4 py-2 text-right">
                      { cashFlow.balance.toLocaleString( "id-ID" ) }
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <p>Sedang memuat Laporan Arus Kas...</p>
          ) }
        </section>

        {/* Summary */ }
        <section>
          <h2 className="text-xl font-bold mb-2 bg-gray-700 text-white px-3 py-2 rounded">
            Laporan Uang Cabang
          </h2>
          { summary ? (
            <div className="overflow-x-auto">
              {/* Ringkasan Total */ }
              <table className="w-full border border-gray-300 text-sm mb-6">
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
                      { summary.total_sales.toLocaleString( "id-ID" ) }
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2">Total HPP</td>
                    <td className="border px-4 py-2 text-right">
                      { summary.total_hpp.toLocaleString( "id-ID" ) }
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2">Total Biaya</td>
                    <td className="border px-4 py-2 text-right">
                      { summary.total_expenses.toLocaleString( "id-ID" ) }
                    </td>
                  </tr>
                  <tr className="bg-gray-50 font-bold">
                    <td className="border px-4 py-2">Laba Bersih</td>
                    <td className="border px-4 py-2 text-right">
                      { summary.net_profit.toLocaleString( "id-ID" ) }
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Per Cabang */ }
              <h3 className="text-lg font-semibold mb-2 bg-gray-700 text-white px-3 py-2 rounded">
                Detail Per Cabang
              </h3>
              <table className="w-full border border-gray-300 text-sm">
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
                  { summary.by_branch.map( ( b, idx ) => (
                    <tr
                      key={ idx }
                      className={ idx % 2 === 0 ? "bg-white" : "bg-gray-50" }
                    >
                      <td className="border px-4 py-2">{ b.branch_name }</td>
                      <td className="border px-4 py-2 text-right">
                        { b.sales.toLocaleString( "id-ID" ) }
                      </td>
                      <td className="border px-4 py-2 text-right">
                        { b.hpp.toLocaleString( "id-ID" ) }
                      </td>
                      <td className="border px-4 py-2 text-right">
                        { b.expenses.toLocaleString( "id-ID" ) }
                      </td>
                      <td className="border px-4 py-2 text-right font-bold">
                        { b.net_profit.toLocaleString( "id-ID" ) }
                      </td>
                    </tr>
                  ) ) }
                </tbody>
              </table>
            </div>
          ) : (
            <p>Sedang memuat Laporan Uang Cabang...</p>
          ) }
        </section>
      </div>
    </Layout>
  );
};

export default OwnerKeuangan;
