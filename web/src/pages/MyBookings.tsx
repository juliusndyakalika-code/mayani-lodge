import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CalendarDays, BedDouble, Users, Clock, ChevronRight, XCircle, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Booking } from '../types';
import client from '../api/client';
import { useAuthStore } from '../store/useAuthStore';
import { fmtTZS, fmtUSD } from '../utils/price';

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  CONFIRMED: { color: 'text-green-700 bg-green-50 border-green-200', icon: <CheckCircle className="h-4 w-4" />, label: 'Confirmed' },
  PENDING: { color: 'text-yellow-700 bg-yellow-50 border-yellow-200', icon: <Clock className="h-4 w-4" />, label: 'Pending' },
  CANCELLED: { color: 'text-red-600 bg-red-50 border-red-200', icon: <XCircle className="h-4 w-4" />, label: 'Cancelled' },
  COMPLETED: { color: 'text-blue-700 bg-blue-50 border-blue-200', icon: <CheckCircle className="h-4 w-4" />, label: 'Completed' },
};

export function MyBookings() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    client.get('/bookings').then((r) => setBookings(r.data)).finally(() => setLoading(false));
  }, [user]);

  async function handleCancel(id: string) {
    if (!confirm('Cancel this booking? This action cannot be undone.')) return;
    setCancelling(id);
    try {
      const r = await client.patch(`/bookings/${id}/cancel`);
      setBookings((prev) => prev.map((b) => (b.id === id ? r.data : b)));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to cancel booking');
    } finally {
      setCancelling(null);
    }
  }

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const nights = (b: Booking) => Math.ceil((new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) / 86400000);

  const filtered = filterStatus === 'ALL' ? bookings : bookings.filter((b) => b.status === filterStatus);

  if (loading) return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f9f7f4] pt-20 pb-16">
      <div className="bg-[#1a2f4e] text-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-amber-400 text-xs uppercase tracking-[4px] font-semibold mb-2">Your Account</p>
          <h1 className="text-4xl font-bold" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>My Bookings</h1>
          <p className="text-gray-400 text-sm mt-2">{user?.name} · {bookings.length} booking{bookings.length !== 1 ? 's' : ''} total</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
          {['ALL', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filterStatus === s ? 'bg-[#1a2f4e] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'}`}>
              {s === 'ALL' ? 'All Bookings' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
            <CalendarDays className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No bookings yet</h3>
            <p className="text-gray-400 text-sm mb-6">Your reservations will appear here.</p>
            <Link to="/rooms" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
              Browse Rooms <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((booking) => {
              const s = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING;
              const n = nights(booking);
              const isPast = new Date(booking.checkOut) < new Date();
              const canCancel = booking.status === 'CONFIRMED' && !isPast;

              return (
                <div key={booking.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-40 h-32 sm:h-auto flex-shrink-0">
                      <img src={booking.room.images[0]} alt={booking.room.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-[#1a2f4e]" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>{booking.room.name}</h3>
                          <p className="text-xs text-gray-400">Booking #{booking.id.slice(-8).toUpperCase()}</p>
                        </div>
                        <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${s.color}`}>
                          {s.icon} {s.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="h-4 w-4 text-amber-500" />
                          {fmtDate(booking.checkIn)} → {fmtDate(booking.checkOut)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-amber-500" /> {n} night{n !== 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="h-4 w-4 text-amber-500" /> {booking.guests} guest{booking.guests !== 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <BedDouble className="h-4 w-4 text-amber-500" /> {booking.room.bedType}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold text-[#1a2f4e]">{fmtTZS(booking.totalPrice)}</span>
                          <span className="text-xs text-gray-400"> · {fmtUSD(booking.totalPrice)}</span>
                        </div>
                        <div className="flex gap-2">
                          <Link to={`/confirmation/${booking.id}`}
                            className="text-sm font-medium text-amber-600 hover:text-amber-700 border border-amber-200 hover:border-amber-400 px-4 py-2 rounded-lg transition-colors">
                            View Details
                          </Link>
                          {canCancel && (
                            <button onClick={() => handleCancel(booking.id)} disabled={cancelling === booking.id}
                              className="text-sm font-medium text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50">
                              {cancelling === booking.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
