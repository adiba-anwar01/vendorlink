import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { loginVendor } from '../api/authApi';
import useAuthStore from '../store/useAuthStore';

export default function VendorLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await loginVendor({ email, password });
      const { token, user } = res.data;

      login(token, user);

      toast.success('Login successful! Welcome back.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Login failed. Please check your credentials.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f6fa] p-6">
      <div className="w-full max-w-[420px] rounded-[12px] bg-white p-10 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <div className="mb-6 flex items-center gap-2">
          <span className="text-[22px]">🔗</span>
          <span className="text-[18px] font-bold tracking-[-0.3px] text-[#4f46e5]">VendorLink</span>
        </div>

        <h2 className="mb-[6px] text-2xl font-bold text-[#1a1a2e]">Welcome back</h2>
        <p className="mb-7 text-sm text-gray-500">Sign in to your vendor account</p>

        <form onSubmit={handleLogin} noValidate>
          <div className="mb-4 flex flex-col">
            <label className="mb-[6px] text-[13px] font-semibold text-gray-700" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="vendor@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="box-border w-full rounded-lg border border-gray-300 px-[14px] py-[10px] text-sm outline-none"
              autoComplete="email"
            />
          </div>

          <div className="mb-4 flex flex-col">
            <label className="mb-[6px] text-[13px] font-semibold text-gray-700" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="box-border w-full rounded-lg border border-gray-300 px-[14px] py-[10px] text-sm outline-none"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`mt-2 w-full rounded-lg bg-[#4f46e5] p-3 text-[15px] font-semibold text-white transition-opacity duration-200 ${
              loading ? 'opacity-70' : 'opacity-100'
            }`}
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-5 text-center text-[13px] text-gray-500">
          Don't have an account?
          <Link to="/register" className="font-semibold text-[#4f46e5] no-underline">Create Account</Link>
        </p>
      </div>
    </div>
  );
}
