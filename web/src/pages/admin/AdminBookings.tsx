import { useEffect, useState } from 'react';
import { Search, Filter, CalendarDays, Users, ChevronDown } from 'lucide-react';
import client from '../../api/client';
import { fmtTZS } from '../../utils/price';

interface Booking {
  id: string; guestName: string; guestEmail: string; guestPhone: string;
  checkIn: string; checkOut: string; guests: number; totalPrice: number;
  status: string; specialReq?: string; createdAt: string;
  room: { id: string; name: string; type: string; images: string[] };
  user: { id: string; name: string; email: string };
}

const STATUSES = ['ALL', 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED'];

const STATUS_STYLE: Record<string, string> = {
  CONFIRMED: 'bg-green-100 text-green-700 border-green-200',
  PENDING:   'bg-yellow-100 text-yellow-700 border-yellow-200',
  CANCELLED: 'bg-red-100 text-red-600 border-red-200',
  COMPLETED: 'bg-blue-100 text-blue-700 border-blue-200',
};

export function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, [filterStatus]);

  async function fetchBookings() {
    setLoading(true);
    const params: any = {};
    if (filterStatus !== 'ALL') params.status = filterStatus;
    if (search) params.search = search;
    const r = await client.get('/admin/bookings', { params });
    setBookings(r.data);
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    try {
      const r = await client.patch(`/admin/bookings/${id}/status`, { status });
      setBookings((prev) => prev.map((b) => (b.id === id ? r.data : b)));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update status');
    } finally {
      setUpdating(null);
    }
  }

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const nights  = (b: Booking) => Math.ceil((new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) / 86400000);

  const filtered = bookings.filter((b) =>
    !search || b.guestName.toLowerCase().includes(search.toLowerCase()) || b.guestEmail.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1a2f4e]" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>All Bookings</h1>
        <p className="text-gray-500 text-sm mt-1">{filtered.length} booking{filtered.length !== 1 ? 's' : ''} found</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-5 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchBookings()}
            placeholder="Search by guest name or email..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${filterStatus === s ? 'bg-[#1a2f4e] text-white border-[#1a2f4e]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => {
            const isExpanded = expanded === b.id;
            return (
              <div key={b.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Main row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4">
                  <img src={b.room.images[0]} alt={b.room.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900">{b.guestName}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLE[b.status] || STATUS_STYLE.PENDING}`}>
                        {b.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{b.guestEmail} · {b.guestPhone}</p>
                    <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {fmtDate(b.checkIn)} → {fmtDate(b.checkOut)}</span>
                      <span>{nights(b)} night{nights(b) !== 1 ? 's' : ''}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {b.guests} guest{b.guests !== 1 ? 's' : ''}</span>
                      <span className="font-semibold text-gray-700">{b.room.name}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <p className="font-bold text-gray-900">{fmtTZS(b.totalPrice)}</p>
                    <div className="flex items-center gap-2">
                      {/* Status updater */}
                      <div className="relative">
                        <select
                          value={b.status}
                          onChange={(e) => updateStatus(b.id, e.target.value)}
                          disabled={updating === b.id}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 pr-6 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white appearance-none cursor-pointer disabled:opacity-50">
                          {['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                      </div>
                      <button onClick={() => setExpanded(isExpanded ? null : b.id)}
                        className="text-xs text-amber-600 hover:text-amber-700 border border-amber-200 hover:border-amber-400 px-3 py-1.5 rounded-lg transition-colors">
                        {isExpanded ? 'Less' : 'Details'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 grid sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Booking Details</p>
                      <div className="space-y-1 text-gray-600">
                        <p><span className="font-medium">Booking ID:</span> #{b.id.slice(-8).toUpperCase()}</p>
                        <p><span className="font-medium">Booked on:</span> {fmtDate(b.createdAt)}</p>
                        <p><span className="font-medium">Room type:</span> {b.room.type}</p>
                        <p><span className="font-medium">Guests:</span> {b.guests}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Guest Contact</p>
                      <div className="space-y-1 text-gray-600">
                        <p><span className="font-medium">Name:</span> {b.guestName}</p>
                        <p><span className="font-medium">Email:</span> {b.guestEmail}</p>
                        <p><span className="font-medium">Phone:</span> {b.guestPhone}</p>
                        {b.specialReq && <p><span className="font-medium">Requests:</span> {b.specialReq}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <CalendarDays className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No bookings found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
