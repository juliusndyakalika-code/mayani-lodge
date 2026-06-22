import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Users, Maximize2, BedDouble, Star, Check, ChevronLeft, ChevronRight, CalendarDays, AlertCircle } from 'lucide-react';
import { Room } from '../types';
import client from '../api/client';
import { fmtTZS, fmtUSD } from '../utils/price';
import { useAuthStore } from '../store/useAuthStore';

const addDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
};

export function RoomDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || addDays(1));
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || addDays(4));
  const [guests, setGuests] = useState(Number(searchParams.get('guests') || 1));
  const [availability, setAvailability] = useState<boolean | null>(null);
  const [checkingAvail, setCheckingAvail] = useState(false);

  useEffect(() => {
    client.get(`/rooms/${id}`).then((r) => setRoom(r.data)).catch(() => navigate('/rooms')).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!checkIn || !checkOut || !id) return;
    setCheckingAvail(true);
    client.get(`/rooms/${id}/availability`, { params: { checkIn, checkOut } })
      .then((r) => setAvailability(r.data.available))
      .catch(() => setAvailability(null))
      .finally(() => setCheckingAvail(false));
  }, [checkIn, checkOut, id]);

  const nights = checkIn && checkOut
    ? Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
    : 0;

  function handleBook() {
    if (!user) {
      navigate(`/login?redirect=/rooms/${id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
      return;
    }
    navigate(`/booking?roomId=${id}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
  }

  const today = new Date().toISOString().split('T')[0];

  if (loading) return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent" />
    </div>
  );

  if (!room) return null;

  return (
    <div className="min-h-screen bg-[#f9f7f4] pt-20">
      {/* Back */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-amber-600 transition-colors text-sm">
          <ChevronLeft className="h-4 w-4" /> Back to Rooms
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Images + Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="relative rounded-2xl overflow-hidden shadow-md">
              <div className="aspect-video">
                <img src={room.images[imgIdx]} alt={room.name} className="w-full h-full object-cover" />
              </div>
              {room.images.length > 1 && (
                <>
                  <button onClick={() => setImgIdx((i) => (i - 1 + room.images.length) % room.images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button onClick={() => setImgIdx((i) => (i + 1) % room.images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {room.images.map((_, i) => (
                      <button key={i} onClick={() => setImgIdx(i)}
                        className={`h-1.5 rounded-full transition-all ${i === imgIdx ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`} />
                    ))}
                  </div>
                  <div className="absolute top-4 right-4 bg-black/40 text-white text-xs px-2 py-1 rounded-full">
                    {imgIdx + 1} / {room.images.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {room.images.length > 1 && (
              <div className="flex gap-3">
                {room.images.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`w-20 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === imgIdx ? 'border-amber-500' : 'border-transparent'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Room Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-xs font-semibold bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-100">
                  {room.type}
                </span>
                {room.featured && (
                  <span className="text-xs font-semibold bg-amber-500 text-white px-3 py-1 rounded-full flex items-center gap-1">
                    <Star className="h-3 w-3 fill-white" /> Featured
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-[#1a2f4e] mb-4" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                {room.name}
              </h1>

              <div className="flex flex-wrap gap-5 text-sm text-gray-500 mb-6">
                <span className="flex items-center gap-2"><Users className="h-4 w-4 text-amber-500" /> Up to {room.capacity} guests</span>
                <span className="flex items-center gap-2"><Maximize2 className="h-4 w-4 text-amber-500" /> {room.size} m²</span>
                <span className="flex items-center gap-2"><BedDouble className="h-4 w-4 text-amber-500" /> {room.bedType}</span>
              </div>

              <p className="text-gray-600 leading-relaxed mb-6">{room.description}</p>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="font-bold text-[#1a2f4e] mb-4">Room Amenities</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {room.amenities.map((a) => (
                    <div key={a} className="flex items-center gap-2.5 text-sm text-gray-600">
                      <Check className="h-4 w-4 text-amber-500 shrink-0" /> {a}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Hotel Policies */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-[#1a2f4e] mb-4">Hotel Policies</h3>
              <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-600">
                {[
                  { label: 'Check-in', value: '3:00 PM onwards' },
                  { label: 'Check-out', value: 'By 12:00 PM' },
                  { label: 'Cancellation', value: 'Free up to 48h before check-in' },
                  { label: 'Pets', value: 'Not allowed' },
                  { label: 'Smoking', value: 'Non-smoking room' },
                  { label: 'Payment', value: 'All major cards accepted' },
                ].map((p) => (
                  <div key={p.label}>
                    <span className="font-medium text-gray-800">{p.label}: </span>{p.value}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Booking Widget */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24">
              <div className="mb-5">
                <div className="text-2xl font-bold text-[#1a2f4e]" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                  {fmtTZS(room.price)}
                </div>
                <div className="text-gray-400 text-sm">{fmtUSD(room.price)} per night</div>
              </div>

              <div className="flex gap-1 mb-1">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
                <span className="text-xs text-gray-400 ml-1">5.0 · Leganga, Arusha</span>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden mt-5 mb-3">
                <div className="grid grid-cols-2 divide-x divide-gray-200">
                  <label className="p-3 block cursor-pointer hover:bg-gray-50 transition-colors">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" /> Check-in
                    </span>
                    <input type="date" value={checkIn} min={today} onChange={(e) => setCheckIn(e.target.value)}
                      className="text-sm font-semibold text-gray-800 w-full focus:outline-none mt-0.5 bg-transparent" />
                  </label>
                  <label className="p-3 block cursor-pointer hover:bg-gray-50 transition-colors">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" /> Check-out
                    </span>
                    <input type="date" value={checkOut} min={checkIn} onChange={(e) => setCheckOut(e.target.value)}
                      className="text-sm font-semibold text-gray-800 w-full focus:outline-none mt-0.5 bg-transparent" />
                  </label>
                </div>
                <div className="border-t border-gray-200 p-3">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <Users className="h-3 w-3" /> Guests
                  </span>
                  <select value={guests} onChange={(e) => setGuests(Number(e.target.value))}
                    className="text-sm font-semibold text-gray-800 w-full focus:outline-none mt-0.5 bg-transparent">
                    {Array.from({ length: room.capacity }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Availability */}
              {checkIn && checkOut && !checkingAvail && availability !== null && (
                <div className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 mb-3 ${availability ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                  {availability ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  {availability ? 'Available for selected dates' : 'Not available — try different dates'}
                </div>
              )}

              {/* Price Breakdown */}
              {nights > 0 && (
                <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{fmtTZS(room.price)} × {nights} night{nights !== 1 ? 's' : ''}</span>
                    <span>{fmtTZS(room.price * nights)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900">
                    <span>Total</span>
                    <span>{fmtTZS(room.price * nights)}</span>
                  </div>
                  <div className="text-right text-xs text-gray-400">{fmtUSD(room.price * nights)}</div>
                </div>
              )}

              <button
                onClick={handleBook}
                disabled={availability === false || nights < 1}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3.5 rounded-xl transition-all hover:shadow-lg text-sm disabled:cursor-not-allowed"
              >
                {!user ? 'Sign In to Book' : nights < 1 ? 'Select dates' : availability === false ? 'Not Available' : 'Reserve Now'}
              </button>

              <p className="text-center text-xs text-gray-400 mt-3">Free cancellation up to 48 hours before check-in</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
