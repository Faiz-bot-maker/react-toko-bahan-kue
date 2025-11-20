import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { HiOutlineCash, HiOutlineChartBar } from "react-icons/hi";
import { HiOutlineReceiptRefund } from "react-icons/hi2";
import { MdOutlineSavings } from "react-icons/md";
import { TbPackage } from "react-icons/tb";
import { MdInfoOutline } from "react-icons/md";

const getHeaders = () => ( {
    Authorization: localStorage.getItem( "authToken" ),
    "ngrok-skip-browser-warning": "true",
} );

const formatRupiah = ( value ) => {
    if ( value === null || value === undefined ) return "Rp 0";
    const intVal = parseInt( value );
    return "Rp " + intVal.toLocaleString( "id-ID" );
};

const AdminProfitLossReport = () => {
    const [ loading, setLoading ] = useState( false );

    const [ periodType, setPeriodType ] = useState( "all" );
    const [ dateRange, setDateRange ] = useState( [ null, null ] );
    const [ startDate, endDate ] = dateRange;

    const [ report, setReport ] = useState( null );

    const fetchReport = async () => {
        try {
            setLoading( true );

            let params = {
                period: periodType,
            };

            if ( startDate && endDate ) {
                const formatDate = ( date ) => {
                    const d = new Date( date );
                    const year = d.getFullYear();
                    const month = String( d.getMonth() + 1 ).padStart( 2, "0" );
                    const day = String( d.getDate() ).padStart( 2, "0" );
                    return `${year}-${month}-${day}`;
                };
                params.start_at = formatDate( startDate );
                params.end_at = formatDate( endDate );
            }

            const res = await axios.get(
                `${process.env.REACT_APP_API_URL}/finance-report/profit-loss`,
                { headers: getHeaders(), params }
            );

            setReport( res.data?.data || null );
        } catch ( error ) {
            console.error( "Error fetching report:", error );
        } finally {
            setLoading( false );
        }
    };

    useEffect( () => {
        fetchReport();
    }, [ endDate ] );

    const formatMonthRange = ( start, end ) => {
        if ( !start ) return "";

        const format = ( d ) =>
            d.toLocaleDateString( "id-ID", {
                month: "long",
                year: "numeric",
            } );

        if ( !end ) return format( start );

        return `${format( start )} - ${format( end )}`;
    };

    const resetFilters = () => {
        setDateRange( [ null, null ] );
        fetchReport();
        setPeriodType( "all" )
    };

    return (
        <Layout>
            <div className="w-full max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Laporan Laba Rugi</h1>
                </div>

                {/* FILTER */ }
                <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap items-end gap-4">

                    {/* Period */ }
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Periode</label>
                        <select
                            value={ periodType }
                            onChange={ ( e ) => {
                                setPeriodType( e.target.value );
                                setDateRange( [ null, null ] );
                            } }
                            className="border rounded px-3 py-2 w-60"
                        >
                            <option value="all">Semua</option>
                            <option value="monthly">Bulanan</option>
                            <option value="range">Rentang Tanggal</option>
                        </select>
                    </div>

                    {/* RANGE — tetap pakai Start & End Date seperti biasa */ }
                    { ( periodType === "range" ) && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Rentang Tanggal
                                </label>
                                <DatePicker
                                    selectsRange={ true }
                                    startDate={ startDate }
                                    endDate={ endDate }
                                    onChange={ ( update ) => setDateRange( update ) }
                                    isClearable={ true }
                                    dateFormat="dd/MM/yyyy"
                                    className="border rounded px-3 py-2 text-sm w-60"
                                    placeholderText="Pilih rentang tanggal"
                                    maxDate={ new Date() }
                                />
                            </div>
                        </>
                    ) }

                    {/* MONTHLY — 1 input saja, month range */ }
                    { periodType === "monthly" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rentang Bulan</label>
                            <DatePicker
                                selectsRange
                                showMonthYearPicker
                                dateFormat="MM/yyyy"
                                startDate={ startDate }
                                endDate={ endDate }
                                onChange={ ( update ) => setDateRange( update ) }
                                customInput={
                                    <input
                                        className="border rounded px-3 py-2 w-60"
                                        value={ formatMonthRange( startDate, endDate ) }
                                        readOnly
                                    />
                                }
                                placeholderText="Pilih rentang bulan"
                            />



                        </div>
                    ) }

                    <button
                        onClick={ resetFilters }
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                        Reset
                    </button>
                </div>

                {/* TABLE */ }
                <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Keterangan</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">Nominal</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200">
                                { loading ? (
                                    <tr>
                                        <td colSpan={ 2 } className="px-6 py-12 text-center">
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                                                <span className="ml-3 text-gray-600 text-sm">Memuat data...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : !report ? (
                                    <tr>
                                        <td colSpan={ 2 } className="px-8 py-16 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="p-4 bg-gray-100 rounded-full mb-4">
                                                    <MdInfoOutline className="text-4xl text-gray-400" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                                    Tidak ada data
                                                </h3>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    <>
                                        {/* Penjualan */ }
                                        <tr className="hover:bg-gray-50">
                                            <td className="px-6 py-4 flex items-center gap-2 font-medium text-gray-700">
                                                <HiOutlineCash className="text-green-700 text-xl" />
                                                Penjualan
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                { formatRupiah( report.sales ) }
                                            </td>
                                        </tr>

                                        {/* HPP */ }
                                        <tr className="hover:bg-gray-50">
                                            <td className="px-6 py-4 flex items-center gap-2 font-medium text-gray-700">
                                                <TbPackage className="text-blue-700 text-xl" />
                                                Harga Pokok Penjualan (HPP)
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                { formatRupiah( report.hpp ) }
                                            </td>
                                        </tr>

                                        {/* Laba Kotor */ }
                                        <tr className="bg-green-50 hover:bg-green-100">
                                            <td className="px-6 py-4 flex items-center gap-2 font-semibold text-gray-800">
                                                <HiOutlineChartBar className="text-green-800 text-xl" />
                                                Laba Kotor
                                            </td>
                                            <td className="px-6 py-4 text-right font-semibold">
                                                { formatRupiah( report.gross_profit ) }
                                            </td>
                                        </tr>

                                        {/* Pengeluaran */ }
                                        <tr className="hover:bg-gray-50">
                                            <td className="px-6 py-4 flex items-center gap-2 font-medium text-gray-700">
                                                <HiOutlineReceiptRefund className="text-red-700 text-xl" />
                                                Total Pengeluaran
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                { formatRupiah( report.expenses ) }
                                            </td>
                                        </tr>

                                        {/* Laba Bersih */ }
                                        <tr className="bg-green-100 hover:bg-green-200">
                                            <td className="px-6 py-4 flex items-center gap-2 font-semibold text-gray-800">
                                                <MdOutlineSavings className="text-green-900 text-xl" />
                                                Laba Bersih
                                            </td>
                                            <td
                                                className={ `px-6 py-4 text-right font-bold ${report.net_profit >= 0 ? "text-green-700" : "text-red-700"
                                                    }` }
                                            >
                                                { formatRupiah( report.net_profit ) }
                                            </td>
                                        </tr>
                                    </>
                                ) }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default AdminProfitLossReport;