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

  // All prices in TZS
  const rooms = [
    {
      name: 'Classic Room',
      type: 'STANDARD',
      description: 'A well-appointed ground-floor room set in the peaceful compound of Mayian Luxury Motel. Clean, comfortable and cool — perfect for a restful stopover in Usa River, Arusha.',
      price: 45000,
      capacity: 2,
      size: 32,
      bedType: 'Double Bed',
      featured: false,
      amenities: JSON.stringify(['Free WiFi', 'Fan', 'Flat-screen TV', 'Hot Shower', 'Daily Housekeeping', 'Free Parking', 'Mosquito Net', 'Tea & Coffee Maker']),
      images: JSON.stringify([
        '/images/mayian-tower.png',
        '/images/mayian-grounds.png',
        '/images/mayian-entrance.png',
      ]),
    },
    {
      name: 'Deluxe Room',
      type: 'DELUXE',
      description: 'A spacious deluxe room in the iconic round tower building. Larger windows, quality furnishings, and a verandah balcony overlooking the lush compound gardens.',
      price: 50000,
      capacity: 2,
      size: 45,
      bedType: 'King Bed',
      featured: true,
      amenities: JSON.stringify(['Free WiFi', 'Air Conditioning', 'Flat-screen TV', 'Hot Shower', 'Private Balcony', 'Mini Fridge', 'Room Service', 'Daily Housekeeping', 'Free Parking', 'Mosquito Net']),
      images: JSON.stringify([
        '/images/mayian-entrance.png',
        '/images/mayian-tower.png',
        '/images/mayian-garden.png',
      ]),
    },
    {
      name: 'Junior Suite',
      type: 'SUITE',
      description: 'A generously sized suite with a separate sitting area and garden views. Ideal for couples or small families seeking extra comfort and space in Usa River.',
      price: 50000,
      capacity: 3,
      size: 65,
      bedType: 'King Bed + Sofa',
      featured: true,
      amenities: JSON.stringify(['Free WiFi', 'Air Conditioning', 'Smart TV', 'Hot Shower', 'Separate Sitting Area', 'Mini Fridge', 'Room Service', 'Garden View', 'Daily Housekeeping', 'Free Parking', 'Tea & Coffee Maker']),
      images: JSON.stringify([
        '/images/mayian-garden.png',
        '/images/mayian-grounds.png',
        '/images/mayian-tower2.png',
      ]),
    },
    {
      name: 'Family Suite',
      type: 'SUITE',
      description: 'Perfect for families exploring Arusha and Mount Meru. Two comfortable bedrooms with a shared living area, plenty of space, and easy access to the motel\'s bar and restaurant.',
      price: 50000,
      capacity: 5,
      size: 90,
      bedType: 'King Bed + 2 Single Beds',
      featured: false,
      amenities: JSON.stringify(['Free WiFi', 'Air Conditioning', 'Two Bedrooms', 'Two Bathrooms', 'Living Area', 'Two Smart TVs', 'Mini Fridge', 'Room Service', 'Daily Housekeeping', 'Free Parking', 'Mosquito Nets']),
      images: JSON.stringify([
        '/images/mayian-grounds.png',
        '/images/mayian-garden.png',
        '/images/mayian-hero.png',
      ]),
    },
    {
      name: 'Grand Suite',
      type: 'SUITE',
      description: 'Our most spacious suite with a king bedroom, private lounge, and a wide balcony offering stunning views of the compound gardens and distant Mount Meru peaks.',
      price: 50000,
      capacity: 4,
      size: 120,
      bedType: 'King Bed',
      featured: true,
      amenities: JSON.stringify(['Free WiFi', 'Air Conditioning', 'Private Lounge', 'Balcony with Mountain View', 'Smart TV', 'Mini Bar', '24h Room Service', 'Rain Shower', 'Walk-in Wardrobe', 'Daily Housekeeping', 'Free Parking', 'Tea & Coffee Maker']),
      images: JSON.stringify([
        '/images/mayian-mountain.png',
        '/images/mayian-tower.png',
        '/images/mayian-spiral.png',
      ]),
    },
    {
      name: 'Executive Room',
      type: 'PENTHOUSE',
      description: 'The premier room at Mayian Luxury Motel — upper-floor in the round tower with a wraparound balcony, superior furnishings, and panoramic views of the compound and Arusha highlands.',
      price: 50000,
      capacity: 4,
      size: 55,
      bedType: 'King Bed',
      featured: true,
      amenities: JSON.stringify(['Free WiFi', 'Air Conditioning', 'Wraparound Balcony', 'Panoramic Views', 'Smart TV', 'Mini Bar', '24h Room Service', 'Premium Shower', 'Safe', 'Daily Housekeeping', 'Free Parking', 'Airport Pickup Available', 'Concierge Service']),
      images: JSON.stringify([
        '/images/mayian-tower2.png',
        '/images/mayian-spiral.png',
        '/images/mayian-exterior.png',
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
