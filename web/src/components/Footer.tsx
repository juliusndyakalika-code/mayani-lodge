import { Link } from 'react-router-dom';
import { Hotel, Phone, Mail, MapPin, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer id="contact" className="bg-[#1a2f4e] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <Hotel className="h-8 w-8 text-amber-400" />
              <div>
                <div className="text-xl font-bold" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Mayani Lodge</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Where luxury meets paradise. Experience world-class hospitality, breathtaking ocean views, and memories that last a lifetime.
            </p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-amber-500 transition-all duration-200 hover:scale-110">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-5 text-sm uppercase tracking-wider">Explore</h4>
            <ul className="space-y-3">
              {[
                { label: 'Home', to: '/' },
                { label: 'Our Rooms', to: '/rooms' },
                { label: 'Amenities', to: '/#amenities' },
                { label: 'My Bookings', to: '/my-bookings' },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-gray-400 hover:text-amber-400 transition-colors text-sm">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-5 text-sm uppercase tracking-wider">Room Types</h4>
            <ul className="space-y-3">
              {[
                { label: 'Standard Rooms', type: 'STANDARD' },
                { label: 'Deluxe Rooms', type: 'DELUXE' },
                { label: 'Suites', type: 'SUITE' },
                { label: 'Penthouse', type: 'PENTHOUSE' },
              ].map((item) => (
                <li key={item.type}>
                  <Link to={`/rooms?type=${item.type}`} className="text-gray-400 hover:text-amber-400 transition-colors text-sm">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-5 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-400 text-sm">
                <MapPin className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                <span>Leganga, Arumeru — Arusha, Tanzania</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <Phone className="h-4 w-4 text-amber-400 shrink-0" />
                <span>+255 684 564 767</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <Mail className="h-4 w-4 text-amber-400 shrink-0" />
                <span>mayanilodge@gmai.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">© 2026 Mayani Lodge. All rights reserved.</p>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
              <a key={item} href="#" className="text-gray-500 hover:text-amber-400 transition-colors text-sm">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
