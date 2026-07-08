import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Store, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { loginVendor } from '../api/authApi';
import useAuthStore from '../hooks/useAuthStore';
import { inputField, btnPrimary } from '@/utils/theme';

export default function VendorLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await loginVendor({ email, password });
      const { user, token } = res.data;
      login(token, user);
      toast.success('Login successful!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] hover:-translate-y-1.5 transition-all duration-300 p-8 sm:p-10">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-lg hover:rotate-[10deg] transition-transform duration-300 ease-out cursor-default">
            <Store className="w-7 h-7 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Welcome Back</h1>
            <p className="text-sm text-gray-500 mt-1.5">Sign in to VendorLink</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className={inputField}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className={`${inputField} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-500 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`${btnPrimary} w-full py-3 flex items-center justify-center gap-2`}
          >
            {loading ? (
              'Signing in…'
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-gradient-primary hover:opacity-80 transition-colors">
              Register here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
