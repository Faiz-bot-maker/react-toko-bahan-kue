import { useState, useEffect } from "react";
import axios from "axios";
import { MdLocalShipping } from "react-icons/md";
import Layout from '../../components/Layout';

const API_URL = `${process.env.REACT_APP_API_URL}/distributors`;

const AdminDistributor = () => {
    const [ distributors, setDistributors ] = useState( [] );
    const [ loading, setLoading ] = useState( true );

    useEffect( () => {
        fetchDistributors();
    }, [] );

    const fetchDistributors = async () => {
        try {
            setLoading( true );
            const res = await axios.get( API_URL, {
                headers: {
                    Authorization: localStorage.getItem( "authToken" ),
                    "ngrok-skip-browser-warning": "true",
                },
            } );
            const data = res.data?.data || res.data;
            if ( Array.isArray( data ) ) setDistributors( data );
            else console.error( "Data distributor tidak valid:", res.data );
        } catch ( err ) {
            console.error( "Gagal fetch distributor:", err );
        } finally {
            setLoading( false );
        }
    };

    return (
        <Layout>
            <div className="w-full max-w-7xl mx-auto">
                {/* Header */ }
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <MdLocalShipping className="text-2xl text-orange-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Distributor Cabang</h1>
                            <p className="text-sm text-gray-600">Kelola distributor untuk cabang Anda</p>
                        </div>
                    </div>
                </div>

                {/* Table */ }
                <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">
                                        Nama Distributor
                                    </th>
                                    <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">
                                        Alamat
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                { loading ? (
                                    <tr>
                                        <td colSpan={ 3 } className="px-6 py-12 text-center">
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                                                <span className="ml-3 text-gray-600 text-sm">Memuat data...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : distributors.length === 0 ? (
                                    <tr>
                                        <td colSpan={ 3 } className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center">
                                                <MdLocalShipping className="text-6xl text-gray-300 mb-4" />
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada distributor</h3>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    distributors.map( ( d, idx ) => (
                                        <tr key={ d.id || idx } className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900 text-sm">{ d.name }</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-gray-700 max-w-md truncate text-sm">{ d.address }</div>
                                            </td>
                                        </tr>
                                    ) )
                                ) }
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </Layout>
    );
};

export default AdminDistributor;