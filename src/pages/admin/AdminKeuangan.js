//keuangan
import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const getHeaders = () => ( {
    Authorization: localStorage.getItem( "authToken" ),
    "ngrok-skip-browser-warning": "true",
} );

const API_URL_BALANCE = `${process.env.REACT_APP_API_URL}/finance-report/balance-sheet`;
const API_URL_CASHFLOW = `${process.env.REACT_APP_API_URL}/finance-report/cashflow`;

const AdminKeuangan = () => {
    const [ balanceSheet, setBalanceSheet ] = useState( null );
    const [ cashFlow, setCashFlow ] = useState( null );
    const [ selectedDate, setSelectedDate ] = useState( null ); // Default null untuk semua tanggal
    const [ cashFlowRange, setCashFlowRange ] = useState( [ null, null ] ); // Default null untuk semua periode
    const [ startDate, endDate ] = cashFlowRange;

    const formatLocalDate = ( date ) => {
        if ( !date ) return null;
        const d = new Date( date );
        d.setMinutes( d.getMinutes() - d.getTimezoneOffset() );
        return d.toISOString().split( "T" )[ 0 ];
    };

    // Fetch Balance Sheet
    const fetchBalanceSheet = async () => {
        try {
            const params = {};
            if ( selectedDate ) {
                params.as_of = formatLocalDate( selectedDate )
            }
            const res = await axios.get( API_URL_BALANCE, {
                headers: getHeaders(),
                params,
            } );
            setBalanceSheet( res.data.data );
        } catch ( err ) {
            console.error( "Error fetch balance sheet:", err );
        }
    };

    // Fetch Cash Flow
    const fetchCashFlow = async () => {
        try {
            const params = {};
            if ( startDate && endDate ) {
                params.start_at = formatLocalDate( startDate )
                params.end_at = formatLocalDate( endDate )
            }
            const res = await axios.get( API_URL_CASHFLOW, {
                headers: getHeaders(),
                params,
            } );
            setCashFlow( res.data.data );
        } catch ( err ) {
            console.error( "Error fetch cash flow:", err );
        }
    };

    useEffect( () => {
        fetchBalanceSheet();
    }, [ selectedDate ] );

    useEffect( () => {
        fetchCashFlow();
    }, [ cashFlowRange ] );

    // Export Excel
    const exportAllToExcel = () => {
        if ( !balanceSheet || !cashFlow ) return;

        const wb = XLSX.utils.book_new();

        // Neraca
        const balanceData = [
            [ "Aktiva", "Nominal", "Kewajiban & Ekuitas", "Nominal" ],
            [ "Kas & Bank", balanceSheet.assets.cash_and_bank, "Hutang Usaha", balanceSheet.liabilities.accounts_payable ],
            [ "Piutang Usaha", balanceSheet.assets.accounts_receivable, "Total Kewajiban Lancar", balanceSheet.liabilities.total_current_liabilities ],
            [ "Persediaan", balanceSheet.assets.inventory, "Modal Pemilik", balanceSheet.equity.owner_capital ],
            [ "", "", "Laba Ditahan", balanceSheet.equity.retained_earnings ],
            [ "Total Aktiva Lancar", balanceSheet.assets.total_current_assets, "Total Ekuitas", balanceSheet.equity.total_equity ],
            [ "Total Aktiva", balanceSheet.balance.total_assets, "Kewajiban + Ekuitas", balanceSheet.balance.liabilities_plus_equity ],
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

        XLSX.writeFile( wb, "LaporanKeuangan.xlsx" );
    };

    // Export PDF
    const exportAllToPDF = () => {
        if ( !balanceSheet || !cashFlow ) return;

        const doc = new jsPDF();

        // ====== Neraca ======
        doc.setFontSize( 16 );
        doc.text( "LAPORAN NERACA", 105, 15, { align: "center" } );
        doc.setFontSize( 10 );
        doc.text( `Per ${balanceSheet.as_of || "Semua Tanggal"}`, 105, 22, { align: "center" } );

        autoTable( doc, {
            startY: 30,
            head: [ [ "Aktiva", "Nominal", "Kewajiban & Ekuitas", "Nominal" ] ],
            body: [
                [ "Kas & Bank", balanceSheet.assets.cash_and_bank.toLocaleString( "id-ID" ), "Hutang Usaha", balanceSheet.liabilities.accounts_payable.toLocaleString( "id-ID" ) ],
                [ "Piutang Usaha", balanceSheet.assets.accounts_receivable.toLocaleString( "id-ID" ), "Total Kewajiban Lancar", balanceSheet.liabilities.total_current_liabilities.toLocaleString( "id-ID" ) ],
                [ "Persediaan", balanceSheet.assets.inventory.toLocaleString( "id-ID" ), "Modal Pemilik", balanceSheet.equity.owner_capital.toLocaleString( "id-ID" ) ],
                [ "", "", "Laba Ditahan", balanceSheet.equity.retained_earnings.toLocaleString( "id-ID" ) ],
                [ "Total Aktiva Lancar", balanceSheet.assets.total_current_assets.toLocaleString( "id-ID" ), "Total Ekuitas", balanceSheet.equity.total_equity.toLocaleString( "id-ID" ) ],
                [ "Total Aktiva", balanceSheet.balance.total_assets.toLocaleString( "id-ID" ), "Kewajiban + Ekuitas", balanceSheet.balance.liabilities_plus_equity.toLocaleString( "id-ID" ) ],
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
        doc.text( `Periode: ${cashFlow.period || "Semua Periode"}`, 105, 22, { align: "center" } );

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


        doc.save( "LaporanKeuangan.pdf" );
    };

    return (
        <Layout>
            <div className="p-6 space-y-10">
                <h1 className="text-2xl md:text-3xl font-bold text-center mb-8">📊 Laporan Keuangan</h1>

                {/* Tombol Export */ }
                <div className="flex justify-center gap-4 mb-8">
                    <button onClick={ exportAllToExcel } className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow">
                        Export ke Excel
                    </button>
                    <button onClick={ exportAllToPDF } className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow">
                        Export ke PDF
                    </button>
                </div>

                {/* ====== Laporan Neraca ====== */ }
                <section>
                    <h2 className="text-xl font-bold mb-2 bg-gray-700 text-white px-3 py-2 rounded">
                        Laporan Neraca
                    </h2>

                    {/* Date Picker dan Tombol */ }
                    <div className="mb-4 flex items-center gap-2">
                        <label className="font-medium">Pilih Tanggal:</label>
                        <DatePicker
                            selected={ selectedDate }
                            onChange={ ( date ) => setSelectedDate( date ) }
                            dateFormat="dd/MM/yyyy"
                            isClearable={ true }
                            placeholderText="Semua Tanggal"
                            className="border px-3 py-1 rounded"
                        />
                    </div>

                    { balanceSheet ? (
                        <div className="overflow-x-auto">
                            <table className="w-full border border-gray-300 text-sm">
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
                                        <td className="border px-4 py-2 text-right">{ balanceSheet.assets.cash_and_bank.toLocaleString( "id-ID" ) }</td>
                                        <td className="border px-4 py-2">Hutang Usaha</td>
                                        <td className="border px-4 py-2 text-right">{ balanceSheet.liabilities.accounts_payable.toLocaleString( "id-ID" ) }</td>
                                    </tr>
                                    <tr>
                                        <td className="border px-4 py-2">Piutang Usaha</td>
                                        <td className="border px-4 py-2 text-right">{ balanceSheet.assets.accounts_receivable.toLocaleString( "id-ID" ) }</td>
                                        <td className="border px-4 py-2">Total Kewajiban Lancar</td>
                                        <td className="border px-4 py-2 text-right">{ balanceSheet.liabilities.total_current_liabilities.toLocaleString( "id-ID" ) }</td>
                                    </tr>
                                    <tr>
                                        <td className="border px-4 py-2">Persediaan</td>
                                        <td className="border px-4 py-2 text-right">{ balanceSheet.assets.inventory.toLocaleString( "id-ID" ) }</td>
                                        <td className="border px-4 py-2">Modal Pemilik</td>
                                        <td className="border px-4 py-2 text-right">{ balanceSheet.equity.owner_capital.toLocaleString( "id-ID" ) }</td>
                                    </tr>
                                    <tr>
                                        <td className="border px-4 py-2"></td>
                                        <td className="border px-4 py-2"></td>
                                        <td className="border px-4 py-2">Laba Ditahan</td>
                                        <td className="border px-4 py-2 text-right">{ balanceSheet.equity.retained_earnings.toLocaleString( "id-ID" ) }</td>
                                    </tr>
                                    <tr className="bg-gray-50 font-bold">
                                        <td className="border px-4 py-2">Total Aktiva Lancar</td>
                                        <td className="border px-4 py-2 text-right">{ balanceSheet.assets.total_current_assets.toLocaleString( "id-ID" ) }</td>
                                        <td className="border px-4 py-2">Total Ekuitas</td>
                                        <td className="border px-4 py-2 text-right">{ balanceSheet.equity.total_equity.toLocaleString( "id-ID" ) }</td>
                                    </tr>
                                    <tr className="bg-gray-200 font-bold">
                                        <td className="border px-4 py-2">Total Aktiva</td>
                                        <td className="border px-4 py-2 text-right">{ balanceSheet.balance.total_assets.toLocaleString( "id-ID" ) }</td>
                                        <td className="border px-4 py-2">Kewajiban + Ekuitas</td>
                                        <td className="border px-4 py-2 text-right">{ balanceSheet.balance.liabilities_plus_equity.toLocaleString( "id-ID" ) }</td>
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

                    {/* Date Range Picker dan Tombol */ }
                    <div className="mb-4 flex items-center gap-2">
                        <label className="font-medium">Pilih Periode:</label>
                        <DatePicker
                            selectsRange
                            startDate={ cashFlowRange[ 0 ] }
                            endDate={ cashFlowRange[ 1 ] }
                            onChange={ ( update ) => setCashFlowRange( update ) }
                            dateFormat="dd/MM/yyyy"
                            isClearable={ true }
                            className="border px-3 py-1 rounded"
                        />
                    </div>

                    {/* Tabel Arus Kas */ }
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
                        <p>Pilih periode terlebih dahulu</p>
                    ) }
                </section>

            </div>
        </Layout>
    );
};

export default AdminKeuangan;
