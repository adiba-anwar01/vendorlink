import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { registerVendor } from '../api/authApi';

export default function VendorRegister() {
  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [latitude, setLatitude]   = useState('');
  const [longitude, setLongitude] = useState('');
  const [loading, setLoading]     = useState(false);
  const navigate = useNavigate();

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        toast.success('Location detected!');
      },
      () => toast.error('Unable to retrieve your location. Please enter it manually.')
    );
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || latitude === '' || longitude === '') {
      toast.error('All fields are required.');
      return;
    }

    if (isNaN(Number(latitude)) || isNaN(Number(longitude))) {
      toast.error('Latitude and Longitude must be valid numbers.');
      return;
    }

    const payload = {
      name,
      email,
      password,
      role: 'vendor',
      latitude: Number(latitude),
      longitude: Number(longitude),
    };

    try {
      setLoading(true);
      const res = await registerVendor(payload);
      toast.success(res.data.message || 'Registration successful. Please login.');
      navigate('/login', { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f6fa] p-6">
      <div className="w-full max-w-[480px] rounded-[12px] bg-white p-10 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        {/* Brand */}
        <div className="mb-6 flex items-center gap-2">
          <span className="text-[22px]">🔗</span>
          <span className="text-[18px] font-bold tracking-[-0.3px] text-[#4f46e5]">VendorLink</span>
        </div>

        <h2 className="mb-[6px] text-2xl font-bold text-[#1a1a2e]">Vendor Registration</h2>
        <p className="mb-7 text-sm text-gray-500">Create your VendorLink account</p>

        <form onSubmit={handleRegister} noValidate>
          <div className="mb-4 flex flex-col">
            <label className="mb-[6px] text-[13px] font-semibold text-gray-700" htmlFor="name">Store Name</label>
            <input
              id="name"
              type="text"
              placeholder="e.g. Shop1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="box-border w-full rounded-lg border border-gray-300 px-[14px] py-[10px] text-sm outline-none"
            />
          </div>

          <div className="mb-4 flex flex-col">
            <label className="mb-[6px] text-[13px] font-semibold text-gray-700" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="vendor@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="box-border w-full rounded-lg border border-gray-300 px-[14px] py-[10px] text-sm outline-none"
            />
          </div>

          <div className="mb-4 flex flex-col">
            <label className="mb-[6px] text-[13px] font-semibold text-gray-700" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="box-border w-full rounded-lg border border-gray-300 px-[14px] py-[10px] text-sm outline-none"
            />
          </div>

          <div className="flex gap-3">
            <div className="mb-4 flex flex-1 flex-col">
              <label className="mb-[6px] text-[13px] font-semibold text-gray-700" htmlFor="latitude">Latitude</label>
              <input
                id="latitude"
                type="number"
                step="any"
                placeholder="e.g. 28.6139"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="box-border w-full rounded-lg border border-gray-300 px-[14px] py-[10px] text-sm outline-none"
              />
            </div>
            <div className="mb-4 flex flex-1 flex-col">
              <label className="mb-[6px] text-[13px] font-semibold text-gray-700" htmlFor="longitude">Longitude</label>
              <input
                id="longitude"
                type="number"
                step="any"
                placeholder="e.g. 77.2090"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="box-border w-full rounded-lg border border-gray-300 px-[14px] py-[10px] text-sm outline-none"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleGetLocation}
            className="mb-4 w-full rounded-lg border border-dashed border-[#6366f1] bg-[#eef2ff] p-[9px] text-[13px] font-semibold text-[#4f46e5]"
          >
            📍 Use My Current Location
          </button>

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-lg bg-[#4f46e5] p-3 text-[15px] font-semibold text-white transition-opacity duration-200 ${
              loading ? 'opacity-70' : 'opacity-100'
            }`}
          >
            {loading ? 'Registering...' : 'Register as Vendor'}
          </button>
        </form>

        <p className="mt-5 text-center text-[13px] text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#4f46e5] no-underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
