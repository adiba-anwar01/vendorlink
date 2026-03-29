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
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Brand */}
        <div style={styles.brand}>
          <span style={styles.brandIcon}>🔗</span>
          <span style={styles.brandName}>VendorLink</span>
        </div>

        <h2 style={styles.title}>Vendor Registration</h2>
        <p style={styles.subtitle}>Create your VendorLink account</p>

        <form onSubmit={handleRegister} noValidate>
          <div style={styles.field}>
            <label style={styles.label} htmlFor="name">Store Name</label>
            <input
              id="name"
              type="text"
              placeholder="e.g. Shop1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label} htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="vendor@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label} htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.row}>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label} htmlFor="latitude">Latitude</label>
              <input
                id="latitude"
                type="number"
                step="any"
                placeholder="e.g. 28.6139"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label} htmlFor="longitude">Longitude</label>
              <input
                id="longitude"
                type="number"
                step="any"
                placeholder="e.g. 77.2090"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleGetLocation}
            style={styles.locationBtn}
          >
            📍 Use My Current Location
          </button>

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Registering...' : 'Register as Vendor'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f6fa',
    padding: '24px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    padding: '40px',
    width: '100%',
    maxWidth: '480px',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '24px',
  },
  brandIcon: {
    fontSize: '22px',
  },
  brandName: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#4f46e5',
    letterSpacing: '-0.3px',
  },
  title: {
    margin: '0 0 6px',
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a1a2e',
  },
  subtitle: {
    margin: '0 0 28px',
    fontSize: '14px',
    color: '#6b7280',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '16px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '6px',
    color: '#374151',
  },
  input: {
    padding: '10px 14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  row: {
    display: 'flex',
    gap: '12px',
  },
  locationBtn: {
    width: '100%',
    padding: '9px',
    marginBottom: '16px',
    border: '1px dashed #6366f1',
    borderRadius: '8px',
    backgroundColor: '#eef2ff',
    color: '#4f46e5',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  submitBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  footer: {
    marginTop: '20px',
    textAlign: 'center',
    fontSize: '13px',
    color: '#6b7280',
  },
  link: {
    color: '#4f46e5',
    fontWeight: '600',
    textDecoration: 'none',
  },
};
