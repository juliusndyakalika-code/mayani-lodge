import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, TrendingUp, BedDouble, Users, CheckCircle, XCircle, Clock, ArrowRight, LogIn, LogOut } from 'lucide-react';
import client from '../../api/client';
import { fmtTZS } from '../../utils/price';

interface Stats {
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  todayCheckIns: number;
  todayCheckOuts: number;
  totalRevenue: number;
  totalRooms: number;
  unavailableRooms: number;
  recentBookings: any[];
}

const STATUS_STYLE: Record<string, string> = {
  CONFIRMED: 'bg-green-100 text-green-700',
  PENDING:   'bg-yellow-100 text-yellow-700',
  CANCELLED: 'bg-red-100 text-red-600',
  COMPLETED: 'bg-blue-100 text-blue-700',
};

export function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/admin/dashboard').then((r) => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-amber-500 border-t-transparent" />
    </div>
  );
  if (!stats) return null;

  const CARDS = [
    { label: 'Total Revenue',    value: fmtTZS(stats.totalRevenue),          icon: TrendingUp,  color: 'bg-amber-50 text-amber-600',  border: 'border-amber-200' },
    { label: 'Total Bookings',   value: String(stats.totalBookings),          icon: CalendarDays, color: 'bg-blue-50 text-blue-600',   border: 'border-blue-200' },
    { label: "Today's Check-ins",value: String(stats.todayCheckIns),          icon: LogIn,        color: 'bg-green-50 text-green-600', border: 'border-green-200' },
    { label: "Today's Check-outs",value: String(stats.todayCheckOuts),        icon: LogOut,       color: 'bg-orange-50 text-orange-600',border: 'border-orange-200' },
    { label: 'Confirmed',        value: String(stats.confirmedBookings),      icon: CheckCircle,  color: 'bg-green-50 text-green-600', border: 'border-green-200' },
    { label: 'Cancelled',        value: String(stats.cancelledBookings),      icon: XCircle,      color: 'bg-red-50 text-red-500',     border: 'border-red-200' },
    { label: 'Total Rooms',      value: String(stats.totalRooms),             icon: BedDouble,    color: 'bg-purple-50 text-purple-600',border: 'border-purple-200' },
    { label: 'Unavailable Rooms',value: String(stats.unavailableRooms),       icon: Clock,        color: 'bg-gray-50 text-gray-500',   border: 'border-gray-200' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1a2f4e]" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {CARDS.map((c) => (
          <div key={c.label} className={`bg-white rounded-2xl p-5 border ${c.border} shadow-sm`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${c.color}`}>
              <c.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{c.value}</p>
            <p className="text-xs text-gray-500 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Occupancy bar */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2"><BedDouble className="h-4 w-4 text-amber-500" /> Room Availability</h3>
          <span className="text-sm font-bold text-amber-600">
            {stats.totalRooms - stats.unavailableRooms}/{stats.totalRooms} available
          </span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all"
            style={{ width: `${((stats.totalRooms - stats.unavailableRooms) / stats.totalRooms) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Available</span>
          <span>{Math.round(((stats.totalRooms - stats.unavailableRooms) / stats.totalRooms) * 100)}%</span>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Recent Bookings</h3>
          <Link to="/admin/bookings" className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Guest', 'Room', 'Check-in', 'Check-out', 'Amount', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.recentBookings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{b.guestName}</p>
                    <p className="text-xs text-gray-400">{b.guestEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{b.room.name}</td>
                  <td className="px-4 py-3 text-gray-600">{fmtDate(b.checkIn)}</td>
                  <td className="px-4 py-3 text-gray-600">{fmtDate(b.checkOut)}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{fmtTZS(b.totalPrice)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[b.status] || STATUS_STYLE.PENDING}`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {stats.recentBookings.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">No bookings yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
