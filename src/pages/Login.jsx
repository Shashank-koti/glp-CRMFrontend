import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FlaskConical, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';

export const Login = () => {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email, password);
      if (res.success) {
        const adminName = res.data?.user?.name || res.data?.name || res.data?.user?.clientName || 'Administrator';
        toast.success(`Welcome back, ${adminName}!`);
        navigate(from, { replace: true });
      } else {
        setError(res.message || 'Authentication failed. Please verify your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message || 'Unable to connect to server. Ensure backend is running on port 5000.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail('admin@glppharma.com');
    setPassword('Admin@123456');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-orange-50/20 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Soft Glow Orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-orange-200/25 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md z-10"
      >
        {/* Login Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-xl shadow-slate-200/60">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/25 mb-4">
              <FlaskConical className="w-7 h-7" />
            </div>
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <span className="font-extrabold text-2xl text-slate-900 tracking-tight">GLP</span>
              <span className="font-bold text-2xl text-emerald-600 tracking-wider">PHARMA</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 mt-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                CRM Portal
              </span>
              <span className="text-[11px] font-bold uppercase tracking-widest text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                Admin Secure
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Products, Impurities & Compliance Documents Control
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 p-3.5 mb-6 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@glppharma.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="orange"
              loading={loading}
              className="w-full mt-2"
              size="lg"
            >
              <span>Sign In to Dashboard</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          {/* Quick Demo Credentials Autofill */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={fillDemoAdmin}
              className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/90 text-xs font-semibold text-emerald-800 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Use Superadmin Credentials</span>
            </button>
            <div className="text-[11px] text-center text-slate-500 mt-2 font-mono-code">
              admin@glppharma.com / Admin@123456
            </div>
          </div>
        </div>

        {/* Security Footer Notice */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-6 text-center">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Restricted to Authorized GLP Pharma Personnel Only</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
