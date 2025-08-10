// src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineLockClosed, HiOutlineUser, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(username, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-jade-50">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-jade-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />

      <div className="relative z-10 grid min-h-screen grid-cols-1 md:grid-cols-2">
        <div className="relative hidden md:block">
          <img
            src="https://plus.unsplash.com/premium_photo-1700593974557-34f2837447c7?q=80&w=388&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Bahan-bahan kue lengkap"
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/10" />
        </div>

        <div className="flex items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-md">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl ring-1 ring-black/5 border border-white/60">
              <div className="px-8 pt-8 pb-2">
                <div className="flex items-center gap-3 mb-6 md:hidden select-none">
                  <div className="bg-gradient-to-tr from-jade-100 to-blue-100 p-3 rounded-xl shadow-inner border border-white/60">
                    <HiOutlineLockClosed className="text-jade-600 text-2xl" />
                  </div>
            <div>
                    <div className="text-xl font-extrabold tracking-tight text-slate-800">Toko Bahan</div>
                    <div className="text-slate-500 text-xs">Dashboard Admin</div>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">Masuk</h2>
                <p className="text-slate-500 text-sm mb-6">Silakan masukkan kredensial Anda</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <HiOutlineUser className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-jade-500 focus:border-jade-500 placeholder-slate-400 text-slate-900"
                  placeholder="Masukkan username"
                  required
                        autoComplete="username"
                />
              </div>
            </div>

            <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <HiOutlineLockClosed className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-jade-500 focus:border-jade-500 placeholder-slate-400 text-slate-900"
                        placeholder="Masukkan password"
                  required
                        autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                        aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? (
                          <HiOutlineEyeOff className="h-5 w-5" />
                  ) : (
                          <HiOutlineEye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={isLoading}
                    className="w-full bg-gradient-to-r from-jade-600 to-blue-600 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-jade-200/40 hover:from-jade-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-jade-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
                    {isLoading ? 'Memproses…' : 'Masuk'}
            </button>
          </form>
              </div>

              <div className="px-8 pb-6">
                <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-4" />
                <p className="text-xs text-slate-500 text-center">Hak Cipta © {new Date().getFullYear()} Toko Bahan. Seluruh hak cipta dilindungi.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
