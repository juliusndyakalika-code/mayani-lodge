import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, CalendarDays, Users, Wifi, Car, Utensils, Trees,
  ChevronRight, Shield, Award, Clock, Star, ChevronLeft,
} from 'lucide-react';
import { RoomCard } from '../components/RoomCard';
import { Room } from '../types';
import client from '../api/client';

// Real Mayian Luxury Motel photos
const PHOTOS = {
  hero:     '/images/mayani-hero.jpeg',
  pathway:  '/images/mayani-pathway.jpeg',
  spiral:   '/images/mayani-spiral.jpeg',
  garden:   '/images/mayani-garden.jpeg',
  entrance: '/images/mayani-entrance.jpeg',
};

const GALLERY = [
  { src: PHOTOS.hero,     label: 'Main Entrance' },
  { src: PHOTOS.pathway,  label: 'Garden Pathway' },
  { src: PHOTOS.spiral,   label: 'Courtyard' },
  { src: PHOTOS.garden,   label: 'Tropical Gardens' },
  { src: PHOTOS.entrance, label: 'Lodge Verandah' },
];

const AMENITIES = [
  { icon: Trees,    label: 'Tropical Gardens',  desc: 'Lush manicured grounds with exotic palms & plants', img: PHOTOS.garden },
  { icon: Utensils, label: 'Restaurant & Bar',  desc: 'Fresh local cuisine and refreshing drinks daily',   img: PHOTOS.pathway },
  { icon: Wifi,     label: 'Free WiFi',          desc: 'High-speed internet throughout the property',       img: PHOTOS.entrance },
  { icon: Shield,   label: 'Secure & Private',   desc: 'Gated compound with 24/7 security',                img: PHOTOS.spiral },
];

const REVIEWS = [
  { name: 'Sarah M.',  country: 'Kenya',          rating: 5, text: 'Absolutely beautiful grounds. The bungalows are so peaceful and the staff were incredibly welcoming. Will definitely come back!' },
  { name: 'James O.',  country: 'Uganda',         rating: 5, text: 'Mayian Luxury Motel is a hidden gem in Usa River. Tranquil, green, and well-kept. Exactly what I needed for a quiet getaway.' },
  { name: 'Amina K.', country: 'Tanzania',        rating: 5, text: 'The gardens are stunning and the rooms are spacious and clean. Great value for the quality you get.' },
];

const addDays = (n: number) => {
  const d = new Date(); d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
};

export function Home() {
  const navigate = useNavigate();
  const [checkIn,  setCheckIn]  = useState(addDays(1));
  const [checkOut, setCheckOut] = useState(addDays(4));
  const [guests,   setGuests]   = useState(2);
  const [featuredRooms, setFeaturedRooms] = useState<Room[]>([]);
  const [reviewIdx,     setReviewIdx]     = useState(0);
  const [galleryIdx,    setGalleryIdx]    = useState(0);

  useEffect(() => {
    client.get('/rooms?featured=true').then((r) => setFeaturedRooms(r.data)).catch(() => {});
  }, []);

  // Auto-advance gallery
  useEffect(() => {
    const t = setInterval(() => setGalleryIdx((i) => (i + 1) % GALLERY.length), 4000);
    return () => clearInterval(t);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate(`/rooms?${new URLSearchParams({ checkIn, checkOut, guests: String(guests) })}`);
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen">

      {/* ─── Hero ─── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Sliding hero images */}
        {GALLERY.map((g, i) => (
          <img
            key={g.src}
            src={g.src}
            alt={g.label}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === galleryIdx ? 'opacity-100' : 'opacity-0'}`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

        <div className="relative z-10 text-center px-4 w-full max-w-5xl mx-auto">
          <p className="text-amber-400 text-xs uppercase tracking-[5px] mb-4 font-medium">Welcome to</p>
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            Mayian<br /><span className="text-amber-400">Luxury Motel</span>
          </h1>
          <p className="text-white/75 text-base md:text-xl mb-12 max-w-xl mx-auto font-light">
            A tranquil retreat in Usa River, Arusha — where comfort, nature and warm hospitality meet.
          </p>

          {/* Search Card */}
          <form onSubmit={handleSearch} className="bg-white rounded-2xl p-4 sm:p-6 shadow-2xl max-w-4xl mx-auto">
            <p className="text-left text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Find Your Perfect Stay</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <label className="flex flex-col gap-1 text-left">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5 text-amber-500" /> Check-in
                </span>
                <input type="date" value={checkIn} min={today} onChange={(e) => setCheckIn(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium" required />
              </label>

              <label className="flex flex-col gap-1 text-left">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5 text-amber-500" /> Check-out
                </span>
                <input type="date" value={checkOut} min={checkIn} onChange={(e) => setCheckOut(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium" required />
              </label>

              <label className="flex flex-col gap-1 text-left">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-amber-500" /> Guests
                </span>
                <select value={guests} onChange={(e) => setGuests(Number(e.target.value))}
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium">
                  {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>)}
                </select>
              </label>

              <button type="submit"
                className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl px-6 py-2.5 transition-all hover:shadow-lg mt-5 sm:mt-auto text-sm">
                <Search className="h-4 w-4" /> Search Rooms
              </button>
            </div>
          </form>

          {/* Gallery dots */}
          <div className="flex justify-center gap-2 mt-6">
            {GALLERY.map((_, i) => (
              <button key={i} onClick={() => setGalleryIdx(i)}
                className={`h-1.5 rounded-full transition-all ${i === galleryIdx ? 'w-8 bg-amber-400' : 'w-1.5 bg-white/40'}`} />
            ))}
          </div>
        </div>

        {/* Current scene label */}
        <div className="absolute bottom-8 right-8 text-white/50 text-xs uppercase tracking-widest">
          {GALLERY[galleryIdx].label}
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="bg-[#1a2f4e] text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '6',     label: 'Room Types' },
              { value: '4.9★',  label: 'Average Rating' },
              { value: '10+',   label: 'Years of Hospitality' },
              { value: '5,000+',label: 'Happy Guests' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-bold text-amber-400" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>{s.value}</div>
                <div className="text-gray-400 text-xs mt-1 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Rooms ─── */}
      <section className="py-20 bg-[#f9f7f4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-amber-600 text-xs uppercase tracking-[4px] font-semibold mb-3">Accommodation</p>
            <h2 className="text-4xl md:text-5xl font-bold text-[#1a2f4e]" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
              Our Signature Rooms
            </h2>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto text-sm leading-relaxed">
              Spacious bungalow-style rooms nestled among tropical palms — each a private sanctuary of comfort.
            </p>
          </div>

          {featuredRooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredRooms.map((room) => <RoomCard key={room.id} room={room} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                  <div className="h-56 bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-100 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <button onClick={() => navigate('/rooms')}
              className="inline-flex items-center gap-2 border-2 border-amber-500 text-amber-600 hover:bg-amber-500 hover:text-white font-semibold px-8 py-3 rounded-xl transition-all text-sm">
              View All Rooms <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ─── Photo Gallery ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-amber-600 text-xs uppercase tracking-[4px] font-semibold mb-3">The Property</p>
            <h2 className="text-4xl md:text-5xl font-bold text-[#1a2f4e]" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
              Explore Mayian Luxury Motel
            </h2>
          </div>

          <div className="grid grid-cols-12 gap-3 h-[520px]">
            {/* Large left */}
            <div className="col-span-12 md:col-span-6 rounded-2xl overflow-hidden">
              <img src={PHOTOS.hero} alt="Mayian Luxury Motel entrance" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </div>
            {/* Right column 2×2 */}
            <div className="col-span-12 md:col-span-6 grid grid-cols-2 gap-3">
              {[PHOTOS.pathway, PHOTOS.spiral, PHOTOS.garden, PHOTOS.entrance].map((src, i) => (
                <div key={i} className="rounded-xl overflow-hidden">
                  <img src={src} alt={GALLERY[i + 1]?.label} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Amenities ─── */}
      <section id="amenities" className="py-20 bg-[#f9f7f4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-amber-600 text-xs uppercase tracking-[4px] font-semibold mb-3">What We Offer</p>
            <h2 className="text-4xl md:text-5xl font-bold text-[#1a2f4e]" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
              Lodge Amenities
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {AMENITIES.map((a) => (
              <div key={a.label} className="group rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="relative h-44 overflow-hidden">
                  <img src={a.img} alt={a.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <a.icon className="h-5 w-5 text-amber-400 mb-1" />
                    <h3 className="font-bold text-sm" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>{a.label}</h3>
                  </div>
                </div>
                <div className="p-4 bg-white">
                  <p className="text-gray-500 text-xs">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Wifi,   label: 'Free WiFi',       sub: 'Throughout the property' },
              { icon: Car,    label: 'Free Parking',     sub: 'Secure on-site parking' },
              { icon: Clock,  label: '24h Reception',    sub: 'Always here for you' },
              { icon: Award,  label: 'Highly Rated',     sub: 'Trusted by thousands' },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100">
                <item.icon className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Why Choose Us ─── */}
      <section className="py-20 bg-[#1a2f4e] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-amber-400 text-xs uppercase tracking-[4px] font-semibold mb-4">Why Mayian Luxury Motel</p>
              <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                A Place You'll<br />Want to Return To
              </h2>
              <p className="text-gray-300 text-sm leading-relaxed mb-8">
                Mayian Luxury Motel isn't just accommodation — it's a feeling. Nestled in Usa River, Arusha, amid towering palms and manicured lawns, each room offers a private, peaceful escape from the everyday.
              </p>
              <div className="space-y-4">
                {[
                  { title: 'Bungalow Style',     desc: 'Standalone rooms with verandahs — your own private space amid the gardens.' },
                  { title: 'Tropical Setting',   desc: 'Surrounded by palms, flowering plants, and a serene green compound.' },
                  { title: 'Warm Hospitality',   desc: 'Friendly, attentive staff who treat every guest like family.' },
                  { title: 'Secure & Peaceful',  desc: 'Gated compound ensuring privacy, safety, and complete tranquility.' },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white mb-0.5">{item.title}</h4>
                      <p className="text-gray-400 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Real photo grid */}
            <div className="grid grid-cols-2 gap-4">
              <img src={PHOTOS.pathway}  alt="Pathway" className="rounded-2xl w-full h-52 object-cover" />
              <img src={PHOTOS.garden}   alt="Garden"  className="rounded-2xl w-full h-52 object-cover mt-8" />
              <img src={PHOTOS.spiral}   alt="Spiral"  className="rounded-2xl w-full h-52 object-cover" />
              <img src={PHOTOS.entrance} alt="Entrance" className="rounded-2xl w-full h-52 object-cover mt-8" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-20 bg-[#f9f7f4]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-amber-600 text-xs uppercase tracking-[4px] font-semibold mb-3">Guest Reviews</p>
          <h2 className="text-4xl md:text-5xl font-bold text-[#1a2f4e] mb-12" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            What Our Guests Say
          </h2>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="flex justify-center gap-1 mb-6">
              {Array.from({ length: REVIEWS[reviewIdx].rating }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-gray-600 text-lg italic leading-relaxed mb-8">
              "{REVIEWS[reviewIdx].text}"
            </p>
            <div>
              <p className="font-bold text-[#1a2f4e]">{REVIEWS[reviewIdx].name}</p>
              <p className="text-gray-400 text-sm">{REVIEWS[reviewIdx].country}</p>
            </div>
          </div>

          <div className="flex justify-center items-center gap-4 mt-6">
            <button onClick={() => setReviewIdx((i) => (i - 1 + REVIEWS.length) % REVIEWS.length)}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-amber-500 hover:text-amber-500 transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            {REVIEWS.map((_, i) => (
              <button key={i} onClick={() => setReviewIdx(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === reviewIdx ? 'bg-amber-500 w-6' : 'bg-gray-300'}`} />
            ))}
            <button onClick={() => setReviewIdx((i) => (i + 1) % REVIEWS.length)}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-amber-500 hover:text-amber-500 transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="relative py-28 overflow-hidden">
        <img src={PHOTOS.pathway} alt="Mayian Luxury Motel" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#1a2f4e]/75" />
        <div className="relative text-center text-white px-4">
          <h2 className="text-4xl md:text-6xl font-bold mb-4" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            Ready to Experience<br />Mayian Luxury Motel?
          </h2>
          <p className="text-white/75 mb-10 text-lg max-w-xl mx-auto">
            Book directly for the best rates and a warm, personal welcome.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/rooms')}
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-10 py-4 rounded-xl transition-all hover:shadow-xl text-sm">
              Browse Rooms
            </button>
            <a href="tel:+255684564767"
              className="border-2 border-white text-white hover:bg-white hover:text-[#1a2f4e] font-semibold px-10 py-4 rounded-xl transition-all text-sm">
              Call +255 684 564 767
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
