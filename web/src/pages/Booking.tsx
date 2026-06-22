import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Phone, Mail, FileText, CreditCard, Check, Lock } from 'lucide-react';
import { Room } from '../types';
import client from '../api/client';
import { useAuthStore } from '../store/useAuthStore';
import { fmtTZS, fmtUSD } from '../utils/price';

export function Booking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const roomId = searchParams.get('roomId') || '';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guests = Number(searchParams.get('guests') || 1);

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [guestName, setGuestName] = useState(user?.name || '');
  const [guestEmail, setGuestEmail] = useState(user?.email || '');
  const [guestPhone, setGuestPhone] = useState('');
  const [specialReq, setSpecialReq] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    client.get(`/rooms/${roomId}`).then((r) => setRoom(r.data)).catch(() => navigate('/rooms')).finally(() => setLoading(false));
  }, [roomId]);

  const nights = checkIn && checkOut
    ? Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
    : 0;

  const total = room ? room.price * nights : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!guestPhone) { setError('Phone number is required'); return; }
    setError('');
    setSubmitting(true);
    try {
      const booking = await client.post('/bookings', {
        roomId, checkIn, checkOut, guests, guestName, guestEmail, guestPhone, specialReq,
      });
      navigate(`/confirmation/${booking.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent" />
    </div>
  );

  if (!room) return null;

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="min-h-screen bg-[#f9f7f4] pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-amber-600 transition-colors text-sm mb-6">
          <ChevronLeft className="h-4 w-4" /> Back
        </button>

        <div className="mb-8">
          <p className="text-amber-600 text-xs uppercase tracking-[4px] font-semibold mb-1">Final Step</p>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1a2f4e]" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            Complete Your Reservation
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5">
            {/* Guest Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-[#1a2f4e] mb-5 flex items-center gap-2">
                <User className="h-5 w-5 text-amber-500" /> Guest Information
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Full Name *</span>
                  <input value={guestName} onChange={(e) => setGuestName(e.target.value)} required
                    className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="John Smith" />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Email *
                  </span>
                  <input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} required
                    className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="john@example.com" />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <Phone className="h-3 w-3" /> Phone Number *
                  </span>
                  <input type="tel" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} required
                    className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="+1 (234) 567-8900" />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Number of Guests</span>
                  <input type="number" value={guests} readOnly
                    className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
                </label>
              </div>
              <label className="flex flex-col gap-1.5 mt-4">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <FileText className="h-3 w-3" /> Special Requests (optional)
                </span>
                <textarea value={specialReq} onChange={(e) => setSpecialReq(e.target.value)} rows={3}
                  className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                  placeholder="e.g. Early check-in, ocean-facing room, anniversary surprise..." />
              </label>
            </div>

            {/* Payment Demo */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-[#1a2f4e] mb-2 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-amber-500" /> Payment Details
              </h2>
              <p className="text-xs text-gray-400 mb-5">Demo mode — no real payment is processed</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="sm:col-span-2 flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Card Number</span>
                  <input defaultValue="4242 4242 4242 4242" readOnly
                    className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Expiry</span>
                  <input defaultValue="12/28" readOnly
                    className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">CVV</span>
                  <input defaultValue="•••" readOnly
                    className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
                </label>
              </div>
              <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
                <Lock className="h-3.5 w-3.5" /> Your payment information is encrypted and secure
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={submitting || nights < 1}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-4 rounded-xl transition-all hover:shadow-lg text-sm flex items-center justify-center gap-2">
              {submitting ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> Processing...</>
              ) : (
                <><Check className="h-4 w-4" /> Confirm Booking · {fmtTZS(total)}</>
              )}
            </button>

            <p className="text-center text-xs text-gray-400">
              By confirming, you agree to our Terms of Service and Cancellation Policy.
              Free cancellation up to 48 hours before check-in.
            </p>
          </form>

          {/* Right: Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24">
              <h3 className="font-bold text-[#1a2f4e] mb-4">Booking Summary</h3>
              <img src={room.images[0]} alt={room.name} className="w-full h-40 object-cover rounded-xl mb-4" />
              <h4 className="font-bold text-gray-900 text-base mb-1" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>{room.name}</h4>
              <p className="text-xs text-gray-500 mb-4">{room.type} · {room.bedType} · {room.size}m²</p>

              <div className="space-y-2.5 text-sm border-t border-gray-100 pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Check-in</span>
                  <span className="font-medium text-gray-900">{fmtDate(checkIn)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Check-out</span>
                  <span className="font-medium text-gray-900">{fmtDate(checkOut)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Duration</span>
                  <span className="font-medium text-gray-900">{nights} night{nights !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Guests</span>
                  <span className="font-medium text-gray-900">{guests}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 mt-4 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>{fmtTZS(room.price)} × {nights} night{nights !== 1 ? 's' : ''}</span>
                  <span>{fmtTZS(total)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-amber-600">{fmtTZS(total)}</span>
                </div>
                <div className="text-right text-xs text-gray-400">{fmtUSD(total)}</div>
              </div>

              <div className="mt-4 bg-green-50 rounded-xl px-3 py-2.5 text-xs text-green-700 flex items-center gap-2">
                <Check className="h-3.5 w-3.5 shrink-0" /> Free cancellation before {fmtDate(new Date(new Date(checkIn).getTime() - 2 * 86400000).toISOString().split('T')[0])}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
