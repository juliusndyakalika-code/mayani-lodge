import { Link } from 'react-router-dom';
import { Users, Maximize2, BedDouble, Star, ArrowRight } from 'lucide-react';
import { Room } from '../types';
import { fmtTZS, fmtUSD } from '../utils/price';

const TYPE_BADGE: Record<string, string> = {
  STANDARD: 'bg-slate-100 text-slate-600',
  DELUXE: 'bg-blue-50 text-blue-600',
  SUITE: 'bg-purple-50 text-purple-600',
  PENTHOUSE: 'bg-amber-50 text-amber-700',
};

interface Props {
  room: Room;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}

export function RoomCard({ room, checkIn, checkOut, guests }: Props) {
  const searchParams = new URLSearchParams();
  if (checkIn) searchParams.set('checkIn', checkIn);
  if (checkOut) searchParams.set('checkOut', checkOut);
  if (guests) searchParams.set('guests', String(guests));
  const query = searchParams.toString();

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100">
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={room.images[0]}
          alt={room.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${TYPE_BADGE[room.type] || TYPE_BADGE.STANDARD}`}>
          {room.type}
        </span>
        {room.featured && (
          <span className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Star className="h-3 w-3 fill-white" /> Featured
          </span>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-xl font-bold text-[#1a2f4e] mb-1.5 group-hover:text-amber-700 transition-colors" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
          {room.name}
        </h3>
        <p className="text-gray-500 text-sm line-clamp-2 mb-4 leading-relaxed">{room.description}</p>

        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-amber-500" /> {room.capacity} {room.capacity === 1 ? 'Guest' : 'Guests'}</span>
          <span className="flex items-center gap-1.5"><Maximize2 className="h-3.5 w-3.5 text-amber-500" /> {room.size} m²</span>
          <span className="flex items-center gap-1.5"><BedDouble className="h-3.5 w-3.5 text-amber-500" /> {room.bedType}</span>
        </div>

        <div className="flex items-end justify-between pt-3 border-t border-gray-100">
          <div>
            <span className="text-xl font-bold text-[#1a2f4e]">{fmtTZS(room.price)}</span>
            <span className="text-gray-400 text-sm"> / night</span>
            <div className="text-xs text-gray-400">{fmtUSD(room.price)} per night</div>
          </div>
          <Link
            to={`/rooms/${room.id}${query ? '?' + query : ''}`}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            View Room <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
