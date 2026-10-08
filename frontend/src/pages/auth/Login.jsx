import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bus, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, UserCheck, KeyRound } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const redirectByRole = (role) => {
    if (role === 'admin') navigate('/admin/dashboard');
    else if (role === 'driver') navigate('/driver/dashboard');
    else navigate('/student/dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      redirectByRole(user.role);
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail) => {
    setError('');
    setLoading(true);
    setEmail(demoEmail);
    setPassword('password123');

    try {
      const user = await login(demoEmail, 'password123');
      redirectByRole(user.role);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-100 items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-200 mb-4">
            <Bus className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">LPU Shuttle Transit</h1>
          <p className="text-sm text-slate-500 mt-1">Lovely Professional University Campus Transport</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 md:p-8">
          {error && (
            <div className="mb-5 flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@demo.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition shadow-lg shadow-indigo-100 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 text-center">
              Quick 1-Click Demo Login
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('student@demo.com')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition text-center group"
              >
                <UserCheck className="w-4 h-4 text-slate-600 group-hover:text-indigo-600 mb-1" />
                <span className="text-xs font-semibold text-slate-800">Student</span>
                <span className="text-[10px] text-slate-400">demo.com</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('driver@demo.com')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition text-center group"
              >
                <Bus className="w-4 h-4 text-slate-600 group-hover:text-emerald-600 mb-1" />
                <span className="text-xs font-semibold text-slate-800">Driver</span>
                <span className="text-[10px] text-slate-400">demo.com</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin@demo.com')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 transition text-center group"
              >
                <ShieldCheck className="w-4 h-4 text-slate-600 group-hover:text-purple-600 mb-1" />
                <span className="text-xs font-semibold text-slate-800">Admin</span>
                <span className="text-[10px] text-slate-400">demo.com</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-2">
              Password for demo accounts: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">password123</code>
            </p>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Create student account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
