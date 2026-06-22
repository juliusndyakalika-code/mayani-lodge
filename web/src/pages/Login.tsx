import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Hotel, Eye, EyeOff, AlertCircle } from 'lucide-react';
import client from '../api/client';
import { useAuthStore } from '../store/useAuthStore';

export function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const r = await client.post('/auth/login', { email, password });
      setAuth(r.data.user, r.data.token);
      const redirect = searchParams.get('redirect') || '/';
      navigate(redirect);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left image */}
      <div className="hidden lg:block w-1/2 relative">
        <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80"
          alt="Hotel" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#1a2f4e]/70 flex items-center justify-center p-12">
          <div className="text-white text-center">
            <Hotel className="h-12 w-12 text-amber-400 mx-auto mb-4" />
            <h2 className="text-4xl font-bold mb-3" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Mayian Luxury Motel</h2>
            <p className="text-white/70 text-sm leading-relaxed">
              Sign in to manage your reservations, access exclusive member benefits, and enjoy a personalized experience.
            </p>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Hotel className="h-7 w-7 text-amber-500" />
            <span className="text-xl font-bold text-[#1a2f4e]" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Mayian Luxury Motel</span>
          </div>

          <h1 className="text-3xl font-bold text-[#1a2f4e] mb-1" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Welcome Back</h1>
          <p className="text-gray-500 text-sm mb-8">Sign in to your account</p>

          {/* Demo Credentials */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 text-xs text-amber-800">
            <p className="font-semibold mb-1">Demo accounts:</p>
            <p>Guest: <code>guest@example.com</code> / <code>guest123</code></p>
            <p>Admin: <code>admin@mayanilodge.com</code> / <code>admin123</code></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus
                placeholder="you@example.com"
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all" />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Password</span>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3.5 rounded-xl transition-all hover:shadow-lg text-sm flex items-center justify-center gap-2 mt-2">
              {loading ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-amber-600 hover:text-amber-700">Create one</Link>
          </p>

          <div className="text-center mt-4">
            <Link to="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">← Back to homepage</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
