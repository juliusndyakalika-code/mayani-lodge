import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPw = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@mayanilodge.com' },
    update: {},
    create: { email: 'admin@mayanilodge.com', password: adminPw, name: 'Hotel Admin', role: 'ADMIN' },
  });

  const guestPw = await bcrypt.hash('guest123', 10);
  await prisma.user.upsert({
    where: { email: 'guest@example.com' },
    update: {},
    create: { email: 'guest@example.com', password: guestPw, name: 'John Smith', phone: '+1 234 567 8900' },
  });

  // Prices stored in TZS
  const rooms = [
    {
      name: 'Classic Room',
      type: 'STANDARD',
      description: 'A comfortable bungalow-style room set among tropical gardens. Features a well-appointed bedroom, private verandah with columns, and a cool, shaded retreat from the Arusha sun.',
      price: 45000,
      capacity: 2,
      size: 32,
      bedType: 'Double Bed',
      featured: false,
      amenities: JSON.stringify(['Free WiFi', 'Air Conditioning', 'Flat-screen TV', 'Mini Bar', 'Room Service', 'Safe', 'Hair Dryer', 'Tea & Coffee Maker', 'Daily Housekeeping']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=1200&q=80',
      ]),
    },
    {
      name: 'Deluxe Room',
      type: 'DELUXE',
      description: 'A spacious deluxe bungalow with enhanced furnishings, larger windows overlooking the lush gardens, and a private verandah perfect for morning coffee surrounded by tropical palms.',
      price: 50000,
      capacity: 2,
      size: 45,
      bedType: 'King Bed',
      featured: true,
      amenities: JSON.stringify(['Ocean View', 'Private Balcony', 'Free WiFi', 'Air Conditioning', 'Flat-screen TV', 'Mini Bar', 'Room Service', 'Soaking Bathtub', 'Safe', 'Bathrobes & Slippers', 'Nespresso Machine', 'Premium Toiletries']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80',
      ]),
    },
    {
      name: 'Junior Suite',
      type: 'SUITE',
      description: 'Our Junior Suite offers a generous layout with a separate sitting area, ideal for couples or small families seeking extra space in a serene garden setting.',
      price: 50000,
      capacity: 3,
      size: 65,
      bedType: 'King Bed + Sofa Bed',
      featured: true,
      amenities: JSON.stringify(['Ocean Panoramic View', 'Separate Living Area', 'Free WiFi', 'Air Conditioning', '55" Smart TV', 'Mini Bar', '24h Room Service', 'Rain Shower & Bathtub', 'Walk-in Wardrobe', 'Safe', 'Bathrobes & Slippers', 'Nespresso Machine', 'Writing Desk', 'Premium Toiletries']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80',
      ]),
    },
    {
      name: 'Family Suite',
      type: 'SUITE',
      description: 'Perfect for families visiting Arusha. Two bedrooms, a shared living area, and plenty of space for the whole family — all set within the peaceful Leganga compound.',
      price: 50000,
      capacity: 5,
      size: 90,
      bedType: 'King Bed + 2 Twin Beds',
      featured: false,
      amenities: JSON.stringify(['Two Bedrooms', 'Two Bathrooms', 'Living & Dining Area', 'Free WiFi', 'Air Conditioning', 'Two Smart TVs', 'Full Kitchen', 'Room Service', 'Safe', 'Bathrobes & Slippers', 'Nespresso Machine', 'Laundry Service']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
      ]),
    },
    {
      name: 'Grand Suite',
      type: 'SUITE',
      description: 'Our most spacious suite, featuring a large bedroom, sitting lounge, and a wide private verandah overlooking the manicured garden — ideal for a longer stay near Mount Kilimanjaro.',
      price: 50000,
      capacity: 4,
      size: 120,
      bedType: 'King Bed',
      featured: true,
      amenities: JSON.stringify(['360° Ocean View', 'Private Terrace', 'Butler Service', 'Living & Dining Room', 'Free WiFi', 'Air Conditioning', '65" Smart TV', 'Full Bar', '24h Room Service', 'Jacuzzi', 'Walk-in Closet', 'Safe', 'Bathrobes & Slippers', 'Nespresso Machine', 'Fresh Flowers Daily', 'Pillow Menu']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=1200&q=80',
      ]),
    },
    {
      name: 'Executive Room',
      type: 'PENTHOUSE',
      description: 'Our premium executive room — the finest accommodation at Mayian Luxury Motel. Extra-large layout, superior furnishings, and a garden-facing verandah for an elevated Arusha experience.',
      price: 50000,
      capacity: 4,
      size: 55,
      bedType: 'King Bed',
      featured: true,
      amenities: JSON.stringify(['Private Rooftop Pool', '360° Panoramic Views', 'Private Terrace', 'Personal Butler', 'Full Chef Kitchen', 'Home Theater', 'Private Gym', 'Sauna', 'Free WiFi', 'Multiple Smart TVs', 'Full Bar', '24h Room Service', '3 Bathrooms', 'Jacuzzi', 'Walk-in Closets', 'Airport Transfer', 'Concierge Service', 'Rolls-Royce Transfer']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80',
      ]),
    },
  ];

  await prisma.room.deleteMany();
  for (const room of rooms) {
    await prisma.room.create({ data: room });
  }

  console.log('✅ Seed complete!');
  console.log('   Admin: admin@mayanilodge.com / admin123');
  console.log('   Guest: guest@example.com / guest123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
