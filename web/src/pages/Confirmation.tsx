import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Download, CalendarDays, Users, BedDouble, Phone, Mail, ChevronRight } from 'lucide-react';
import { Booking } from '../types';
import client from '../api/client';
import { fmtTZS, fmtUSD } from '../utils/price';

export function Confirmation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get(`/bookings/${id}`).then((r) => setBooking(r.data)).catch(() => navigate('/my-bookings')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent" />
    </div>
  );

  if (!booking) return null;

  const nights = Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / 86400000);
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const shortId = booking.id.slice(-8).toUpperCase();

  return (
    <div className="min-h-screen bg-[#f9f7f4] pt-20 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Success Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1a2f4e] mb-2" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            Booking Confirmed!
          </h1>
          <p className="text-gray-500">A confirmation has been sent to <strong>{booking.guestEmail}</strong></p>
          <div className="mt-4 inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-5 py-2">
            <span className="text-xs text-amber-600 font-semibold uppercase tracking-wider">Booking ID</span>
            <span className="font-bold text-amber-700 text-sm">{shortId}</span>
          </div>
        </div>

        {/* Booking Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-5">
          {/* Room Banner */}
          <div className="relative h-48">
            <img src={booking.room.images[0]} alt={booking.room.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-5 text-white">
              <p className="text-xs uppercase tracking-widest text-amber-300 mb-1">Mayani Lodge</p>
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>{booking.room.name}</h2>
            </div>
            <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {booking.status}
            </div>
          </div>

          <div className="p-6">
            {/* Stay Details */}
            <div className="grid sm:grid-cols-3 gap-5 mb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" /> Check-in
                </p>
                <p className="font-bold text-gray-900 text-sm">{fmtDate(booking.checkIn)}</p>
                <p className="text-xs text-gray-500 mt-0.5">From 3:00 PM</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" /> Check-out
                </p>
                <p className="font-bold text-gray-900 text-sm">{fmtDate(booking.checkOut)}</p>
                <p className="text-xs text-gray-500 mt-0.5">By 12:00 PM</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Duration</p>
                <p className="font-bold text-gray-900 text-sm">{nights} Night{nights !== 1 ? 's' : ''}</p>
                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1"><Users className="h-3 w-3" /> {booking.guests} guest{booking.guests !== 1 ? 's' : ''}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 border-t border-gray-100 pt-5">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Room Details</p>
                <div className="space-y-1.5 text-sm text-gray-600">
                  <p className="flex items-center gap-2"><BedDouble className="h-4 w-4 text-amber-500" /> {booking.room.bedType}</p>
                  <p className="flex items-center gap-2"><Users className="h-4 w-4 text-amber-500" /> Up to {booking.room.capacity} guests</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Guest Contact</p>
                <div className="space-y-1.5 text-sm text-gray-600">
                  <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-amber-500" /> {booking.guestEmail}</p>
                  <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-amber-500" /> {booking.guestPhone}</p>
                </div>
              </div>
            </div>

            {booking.specialReq && (
              <div className="mt-4 bg-blue-50 rounded-xl px-4 py-3">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Special Requests</p>
                <p className="text-sm text-blue-700">{booking.specialReq}</p>
              </div>
            )}

            {/* Total */}
            <div className="mt-5 border-t border-gray-100 pt-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Total Paid</p>
                <p className="text-2xl font-bold text-[#1a2f4e]" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                  {fmtTZS(booking.totalPrice)}
                </p>
                <p className="text-xs text-gray-400">{fmtUSD(booking.totalPrice)}</p>
              </div>
              <button onClick={() => window.print()}
                className="flex items-center gap-2 border border-gray-200 text-gray-600 hover:border-amber-400 hover:text-amber-600 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
                <Download className="h-4 w-4" /> Download Receipt
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Link to="/my-bookings"
            className="flex items-center justify-center gap-2 bg-[#1a2f4e] hover:bg-[#243f62] text-white font-semibold px-6 py-3.5 rounded-xl transition-colors text-sm">
            View All My Bookings <ChevronRight className="h-4 w-4" />
          </Link>
          <Link to="/rooms"
            className="flex items-center justify-center gap-2 border-2 border-amber-500 text-amber-600 hover:bg-amber-500 hover:text-white font-semibold px-6 py-3.5 rounded-xl transition-all text-sm">
            Browse More Rooms <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 bg-amber-50 border border-amber-100 rounded-2xl p-5 text-sm text-amber-800">
          <p className="font-semibold mb-1">Need help?</p>
          <p>Call us at <strong>+255 684 564 767</strong> or email <strong>mayanilodge@gmai.com</strong></p>
        </div>
      </div>
    </div>
  );
}
