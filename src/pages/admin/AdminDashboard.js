import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { HiOutlineClipboardList, HiOutlineCube, HiOutlineTag } from 'react-icons/hi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const getHeaders = () => ( {
    Authorization: localStorage.getItem( 'authToken' ),
    'ngrok-skip-browser-warning': 'true',
} );

const AdminDashboard = () => {
    const [ stats, setStats ] = useState( {
        totalOrders: 0,
        totalProducts: 0,
        totalCategories: 0,
        totalSales: 0,
        totalRevenue: 0,
    } );
    const [ loading, setLoading ] = useState( true );


    useEffect( () => {
        fetchDashboardData();

        // Refresh tiap 15 detik
        const intervalId = setInterval( fetchDashboardData, 15000 );

        // Refresh saat window fokus
        const onFocus = () => fetchDashboardData();
        window.addEventListener( 'focus', onFocus );

        return () => {
            clearInterval( intervalId );
            window.removeEventListener( 'focus', onFocus );
        };
    }, [] );

    const fetchDashboardData = async () => {
        try {
            setLoading( true );

            // Asumsikan backend punya endpoint filter by branch_id
            const [ ordersRes, productsRes, categoriesRes, salesRes ] = await Promise.all( [
                axios.get( `${process.env.REACT_APP_API_URL}/orders`, { headers: getHeaders() } ),
                axios.get( `${process.env.REACT_APP_API_URL}/products`, { headers: getHeaders() } ),
                axios.get( `${process.env.REACT_APP_API_URL}/categories`, { headers: getHeaders() } ),
                axios.get( `${process.env.REACT_APP_API_URL}/sales-and-product-reports/sales`, { headers: getHeaders() } ),
            ] );

            const orders = ordersRes.data?.data || [];
            const products = productsRes.data?.data || [];
            const categories = categoriesRes.data?.data || [];
            const sales = salesRes.data?.data || {};

            setStats( {
                totalOrders: orders.length,
                totalProducts: products.length,
                totalCategories: categories.length,
                totalSales: sales.total_sales || 0,
                totalRevenue: sales.total_revenue || 0,
            } );
        } catch ( err ) {
            console.error( 'Gagal mengambil data dashboard admin cabang:', err );
        } finally {
            setLoading( false );
        }
    };

    const dashboardStats = [
        {
            label: 'Total Pesanan',
            value: stats.totalOrders,
            icon: <HiOutlineClipboardList className="text-3xl text-blue-500" />,
            color: 'from-blue-400/30 to-blue-100',
            shadow: 'shadow-blue-100',
        },
        {
            label: 'Total Produk',
            value: stats.totalProducts,
            icon: <HiOutlineCube className="text-3xl text-green-600" />,
            color: 'from-green-400/30 to-green-100',
            shadow: 'shadow-green-100',
        },
        {
            label: 'Total Stock',
            value: stats.totalCategories,
            icon: <HiOutlineTag className="text-3xl text-purple-500" />,
            color: 'from-purple-400/30 to-purple-100',
            shadow: 'shadow-purple-100',
        },
    ];


    return (
        <Layout
            outerClassName="min-h-screen bg-gradient-to-tr from-white via-blue-50 to-green-50 flex flex-col md:flex-row"
            mainClassName="flex-1 p-4 md:p-8"
        >
            <div className="w-full">
                <div className="flex items-center gap-3 mb-6">
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight drop-shadow">
                        Dashboard Admin Cabang
                    </h1>
                </div>

                {/* Card Statistik */ }
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                    { dashboardStats.map( ( stat ) => (
                        <div
                            key={ stat.label }
                            className={ `flex items-center gap-2 p-4 rounded-xl bg-gradient-to-br ${stat.color} ${stat.shadow} shadow-md hover:shadow-lg hover:scale-102 transition-all duration-300 group cursor-pointer border border-gray-100 backdrop-blur-md` }
                        >
                            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-white/90 group-hover:scale-105 transition-transform shadow-md">
                                { stat.icon }
                            </div>
                            <div>
                                <div className="text-lg font-bold text-gray-900 group-hover:text-green-700 transition-colors drop-shadow">
                                    { loading ? '...' : stat.value }
                                </div>
                                <div className="text-gray-700 text-xs font-medium">{ stat.label }</div>
                            </div>
                        </div>
                    ) ) }
                </div>

            </div>
        </Layout>
    );
};

export default AdminDashboard;