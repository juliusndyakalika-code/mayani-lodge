import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Hotel, Eye, EyeOff, AlertCircle, Check } from 'lucide-react';
import client from '../api/client';
import { useAuthStore } from '../store/useAuthStore';

export function Register() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pwStrong = password.length >= 8;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pwStrong) { setError('Password must be at least 8 characters'); return; }
    setError('');
    setLoading(true);
    try {
      const r = await client.post('/auth/register', { name, email, phone, password });
      setAuth(r.data.user, r.data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:block w-1/2 relative">
        <img src="https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80"
          alt="Hotel" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#1a2f4e]/70 flex items-center justify-center p-12">
          <div className="text-white text-center">
            <Hotel className="h-12 w-12 text-amber-400 mx-auto mb-4" />
            <h2 className="text-4xl font-bold mb-3" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Join Mayani Lodge</h2>
            <p className="text-white/70 text-sm leading-relaxed">
              Create an account for early access to exclusive deals, priority booking, and personalized hospitality.
            </p>
            <div className="mt-8 space-y-3 text-left">
              {['Best rate guarantee', 'Early access to promotions', 'Priority customer support', 'Manage all bookings in one place'].map((b) => (
                <div key={b} className="flex items-center gap-3 text-sm text-white/80">
                  <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  {b}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Hotel className="h-7 w-7 text-amber-500" />
            <span className="text-xl font-bold text-[#1a2f4e]" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Mayani Lodge</span>
          </div>

          <h1 className="text-3xl font-bold text-[#1a2f4e] mb-1" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Create Account</h1>
          <p className="text-gray-500 text-sm mb-8">Join thousands of happy guests</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Full Name *</span>
              <input value={name} onChange={(e) => setName(e.target.value)} required autoFocus
                placeholder="John Smith"
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all" />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email *</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                placeholder="you@example.com"
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all" />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone Number</span>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (234) 567-8900"
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all" />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Password *</span>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required
                  placeholder="Min. 8 characters"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password.length > 0 && (
                <p className={`text-xs flex items-center gap-1 ${pwStrong ? 'text-green-600' : 'text-orange-500'}`}>
                  {pwStrong ? <Check className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                  {pwStrong ? 'Strong password' : 'At least 8 characters required'}
                </p>
              )}
            </label>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3.5 rounded-xl transition-all hover:shadow-lg text-sm flex items-center justify-center gap-2 mt-2">
              {loading ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-amber-600 hover:text-amber-700">Sign in</Link>
          </p>

          <div className="text-center mt-4">
            <Link to="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">← Back to homepage</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
