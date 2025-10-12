import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import {
  HiOutlineCube,
  HiOutlineOfficeBuilding,
  HiOutlineUsers,
  HiOutlineTruck,
} from 'react-icons/hi';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import axios from 'axios';

const getHeaders = () => ( {
  Authorization: localStorage.getItem( 'authToken' ),
  'ngrok-skip-browser-warning': 'true',
} );

const OwnerDashboard = () => {
  const [ stats, setStats ] = useState( {
    totalEmployees: 0,
    totalProducts: 0,
    totalDistributors: 0,
    totalBranches: 0,
  } );
  const [ loading, setLoading ] = useState( true );

  useEffect( () => {
    fetchDashboardData();

    const intervalId = setInterval( fetchDashboardData, 15000 ); // auto refresh tiap 15s
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
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/dashboard`,
        { headers: getHeaders() }
      );

      const data = res.data?.data || {};

      setStats( {
        totalEmployees: data.total_employees || 0,
        totalProducts: data.total_products || 0,
        totalDistributors: data.total_distributors || 0,
        totalBranches: data.total_branches || 0,
      } );
    } catch ( err ) {
      console.error( 'Gagal mengambil data dashboard:', err );
    } finally {
      setLoading( false );
    }
  };

  const dashboardStats = [
    {
      label: 'Total Karyawan',
      value: stats.totalEmployees,
      icon: <HiOutlineUsers className="text-3xl text-blue-500" />,
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
      label: 'Total Distributor',
      value: stats.totalDistributors,
      icon: <HiOutlineTruck className="text-3xl text-purple-500" />,
      color: 'from-purple-400/30 to-purple-100',
      shadow: 'shadow-purple-100',
    },
    {
      label: 'Total Cabang',
      value: stats.totalBranches,
      icon: <HiOutlineOfficeBuilding className="text-3xl text-orange-500" />,
      color: 'from-orange-400/30 to-orange-100',
      shadow: 'shadow-orange-100',
    },
  ];

  const chartData = [
    { bulan: 'Jan', penjualan: 10 },
    { bulan: 'Feb', penjualan: 15 },
    { bulan: 'Mar', penjualan: 8 },
    { bulan: 'Apr', penjualan: 20 },
    { bulan: 'Mei', penjualan: 18 },
    { bulan: 'Jun', penjualan: 25 },
  ];

  return (
    <Layout
      outerClassName="min-h-screen bg-gradient-to-tr from-white via-blue-50 to-green-50 flex flex-col md:flex-row"
      mainClassName="flex-1 p-4 md:p-8"
    >
      <div className="w-full">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight drop-shadow">
            Dashboard Owner
          </h1>
        </div>

        {/* Card Statistik */ }
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
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

        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <h2 className="text-base font-bold mb-3 text-gray-800">
            Grafik Penjualan per Bulan
          </h2>
          <ResponsiveContainer width="100%" height={ 200 }>
            <LineChart
              data={ chartData }
              margin={ { top: 10, right: 30, left: 0, bottom: 0 } }
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bulan" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="penjualan"
                stroke="#16a34a"
                strokeWidth={ 3 }
                activeDot={ { r: 8 } }
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Layout>
  );
};

export default OwnerDashboard;
