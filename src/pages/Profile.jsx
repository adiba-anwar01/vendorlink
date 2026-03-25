import { useState } from 'react';
import { User, Lock, Save, Eye, EyeOff, MapPin, Phone, Mail, Store } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import Modal from '../components/ui/Modal';

export default function Profile() {
  const { vendor, setVendor } = useAuthStore();
  const [form, setForm]       = useState({ ...vendor });
  const [saved, setSaved]     = useState(false);
  const [pwModal, setPwModal] = useState(false);

  const [pw, setPw]         = useState({ current: '', next: '', confirm: '' });
  const [showPw, setShowPw] = useState({});
  const [pwError, setPwError]     = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  const getInitials = (name) =>
    name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'AJ';

  const handleSave = (e) => {
    e.preventDefault();
    setVendor(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const field = (name) => ({
    value: form[name] || '',
    onChange: (e) => setForm((f) => ({ ...f, [name]: e.target.value })),
  });

  const handleChangePassword = () => {
    if (!pw.current)            { setPwError('Enter your current password.'); return; }
    if (pw.next.length < 8)     { setPwError('New password must be at least 8 characters.'); return; }
    if (pw.next !== pw.confirm) { setPwError('Passwords do not match.'); return; }
    setPwError('');
    setPwSuccess(true);
    setTimeout(() => {
      setPwSuccess(false); setPwModal(false); setPw({ current: '', next: '', confirm: '' });
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile hero */}
      <div className="card p-6 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shrink-0 border-2 border-white/30">
            <span className="text-xl font-bold text-white">
              {getInitials(vendor?.name)}
            </span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{vendor?.name}</h1>
            <p className="text-blue-100 text-sm mt-0.5 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5" /> {vendor?.storeName}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-blue-200">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{vendor?.location}</span>
              <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{vendor?.phone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Success banner */}
      {saved && (
        <div className="card p-4 bg-emerald-50 border-l-4 border-emerald-400">
          <p className="text-sm font-semibold text-emerald-700">✓ Profile updated successfully!</p>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSave} className="card p-6 space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
            <User className="w-4 h-4 text-blue-500" />
          </div>
          <h2 className="text-sm font-bold text-gray-900">Account Information</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ProfileField label="Vendor Name">
            <input type="text" className="input-field" {...field('name')} />
          </ProfileField>
          <ProfileField label="Email Address">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="email" className="input-field pl-9" {...field('email')} />
            </div>
          </ProfileField>
          <ProfileField label="Phone Number">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="tel" className="input-field pl-9" {...field('phone')} />
            </div>
          </ProfileField>
          <ProfileField label="Store Name">
            <div className="relative">
              <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" className="input-field pl-9" {...field('storeName')} />
            </div>
          </ProfileField>
          <ProfileField label="Location" className="sm:col-span-2">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" className="input-field pl-9" {...field('location')} />
            </div>
          </ProfileField>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary flex-1 py-3">
            <Save className="w-4 h-4" /> Update Profile
          </button>
          <button
            type="button"
            onClick={() => setPwModal(true)}
            className="btn-secondary"
          >
            <Lock className="w-4 h-4" /> Change Password
          </button>
        </div>
      </form>

      {/* Change Password Modal */}
      <Modal isOpen={pwModal} onClose={() => { setPwModal(false); setPwError(''); }} title="Change Password" size="sm">
        <div className="space-y-4">
          {pwSuccess ? (
            <div className="text-center py-4">
              <p className="text-2xl mb-1">✅</p>
              <p className="text-sm font-semibold text-emerald-600">Password changed successfully!</p>
            </div>
          ) : (
            <>
              {pwError && (
                <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-lg">
                  <p className="text-sm text-red-600">{pwError}</p>
                </div>
              )}
              <PwField label="Current Password" value={pw.current}
                onChange={(v) => setPw((p) => ({ ...p, current: v }))}
                show={showPw.current} onToggle={() => setShowPw((s) => ({ ...s, current: !s.current }))} />
              <PwField label="New Password" value={pw.next}
                onChange={(v) => setPw((p) => ({ ...p, next: v }))}
                show={showPw.next} onToggle={() => setShowPw((s) => ({ ...s, next: !s.next }))} />
              <PwField label="Confirm New Password" value={pw.confirm}
                onChange={(v) => setPw((p) => ({ ...p, confirm: v }))}
                show={showPw.confirm} onToggle={() => setShowPw((s) => ({ ...s, confirm: !s.confirm }))} />
              <button onClick={handleChangePassword} className="btn-primary w-full py-3 mt-2">
                Change Password
              </button>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}

function ProfileField({ label, children, className = '' }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function PwField({ label, value, onChange, show, onToggle }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-field pr-10"
        />
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
