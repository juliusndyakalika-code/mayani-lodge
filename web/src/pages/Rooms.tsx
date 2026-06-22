import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, Search } from 'lucide-react';
import { RoomCard } from '../components/RoomCard';
import { Room } from '../types';
import client from '../api/client';

const TYPES = ['ALL', 'STANDARD', 'DELUXE', 'SUITE', 'PENTHOUSE'] as const;

export function Rooms() {
  const [searchParams] = useSearchParams();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');
  const [guests, setGuests] = useState(Number(searchParams.get('guests') || 1));
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'ALL');
  const [maxPrice, setMaxPrice] = useState(200000);
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'capacity'>('price_asc');

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (selectedType !== 'ALL') params.type = selectedType;
    if (checkIn) params.checkIn = checkIn;
    if (checkOut) params.checkOut = checkOut;
    if (guests > 1) params.capacity = String(guests);

    client.get('/rooms', { params })
      .then((r) => setRooms(r.data))
      .catch(() => setRooms([]))
      .finally(() => setLoading(false));
  }, [selectedType, checkIn, checkOut, guests]);

  const filtered = rooms
    .filter((r) => r.price <= maxPrice)
    .sort((a, b) => {
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'capacity') return b.capacity - a.capacity;
      return a.price - b.price;
    });

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-[#f9f7f4] pt-20">
      {/* Header */}
      <div className="bg-[#1a2f4e] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-amber-400 text-xs uppercase tracking-[4px] font-semibold mb-2">Accommodation</p>
          <h1 className="text-4xl md:text-5xl font-bold" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            Our Rooms & Suites
          </h1>
          <p className="text-gray-400 mt-3 text-sm max-w-xl">
            {filtered.length} room{filtered.length !== 1 ? 's' : ''} available
            {checkIn && checkOut ? ` · ${checkIn} → ${checkOut}` : ''}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Availability Search Strip */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-3 items-end">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Check-in</span>
            <input type="date" value={checkIn} min={today} onChange={(e) => setCheckIn(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 min-w-[140px]" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Check-out</span>
            <input type="date" value={checkOut} min={checkIn || today} onChange={(e) => setCheckOut(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 min-w-[140px]" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Guests</span>
            <select value={guests} onChange={(e) => setGuests(Number(e.target.value))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 min-w-[120px]">
              {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>)}
            </select>
          </label>
          <div className="flex gap-3 ml-auto">
            <button onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 border border-gray-200 text-gray-600 hover:border-amber-400 hover:text-amber-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </button>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="capacity">Most Guests</option>
            </select>
          </div>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Room Type</p>
                <div className="flex flex-wrap gap-2">
                  {TYPES.map((t) => (
                    <button key={t} onClick={() => setSelectedType(t)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${selectedType === t ? 'bg-amber-500 border-amber-500 text-white' : 'border-gray-200 text-gray-600 hover:border-amber-400'}`}>
                      {t === 'ALL' ? 'All Types' : t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 min-w-[200px]">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Max Price: <span className="text-amber-600">TZS {maxPrice.toLocaleString()}/night</span>
                </p>
                <input type="range" min={10000} max={200000} step={5000} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-amber-500" />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>TZS 10,000</span><span>TZS 200,000</span>
                </div>
              </div>
              <button onClick={() => { setSelectedType('ALL'); setMaxPrice(200000); setCheckIn(''); setCheckOut(''); setGuests(1); }}
                className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 mt-auto">
                <X className="h-3.5 w-3.5" /> Reset
              </button>
            </div>
          </div>
        )}

        {/* Type tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
          {TYPES.map((t) => (
            <button key={t} onClick={() => setSelectedType(t)}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedType === t ? 'bg-[#1a2f4e] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'}`}>
              {t === 'ALL' ? 'All Rooms' : t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Room Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                <div className="h-56 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-full" />
                  <div className="h-4 bg-gray-100 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((room) => (
              <RoomCard key={room.id} room={room} checkIn={checkIn} checkOut={checkOut} guests={guests} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No rooms found</h3>
            <p className="text-gray-400 text-sm">Try adjusting your filters or dates.</p>
          </div>
        )}
      </div>
    </div>
  );
}
