import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate, requireAdmin);

function parseRoom(room: any) {
  return { ...room, amenities: JSON.parse(room.amenities), images: JSON.parse(room.images) };
}

// ── Dashboard Stats ──────────────────────────────────────────
router.get('/dashboard', async (_req, res) => {
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayEnd   = new Date(); todayEnd.setHours(23, 59, 59, 999);

  const [
    totalBookings,
    confirmedBookings,
    cancelledBookings,
    todayCheckIns,
    todayCheckOuts,
    revenue,
    recentBookings,
    totalRooms,
    unavailableRooms,
  ] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({ where: { status: 'CONFIRMED' } }),
    prisma.booking.count({ where: { status: 'CANCELLED' } }),
    prisma.booking.count({ where: { checkIn:  { gte: todayStart, lte: todayEnd }, status: { not: 'CANCELLED' } } }),
    prisma.booking.count({ where: { checkOut: { gte: todayStart, lte: todayEnd }, status: { not: 'CANCELLED' } } }),
    prisma.booking.aggregate({ where: { status: { not: 'CANCELLED' } }, _sum: { totalPrice: true } }),
    prisma.booking.findMany({
      take: 8, orderBy: { createdAt: 'desc' },
      include: { room: true, user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.room.count(),
    prisma.room.count({ where: { available: false } }),
  ]);

  return res.json({
    totalBookings,
    confirmedBookings,
    cancelledBookings,
    todayCheckIns,
    todayCheckOuts,
    totalRevenue: revenue._sum.totalPrice || 0,
    totalRooms,
    unavailableRooms,
    recentBookings: recentBookings.map((b) => ({ ...b, room: parseRoom(b.room) })),
  });
});

// ── Bookings ─────────────────────────────────────────────────
router.get('/bookings', async (req, res) => {
  const { status, search } = req.query;
  const where: any = {};
  if (status && status !== 'ALL') where.status = status;
  if (search) {
    where.OR = [
      { guestName:  { contains: search as string } },
      { guestEmail: { contains: search as string } },
    ];
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: { room: true, user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return res.json(bookings.map((b) => ({ ...b, room: parseRoom(b.room) })));
});

router.patch('/bookings/:id/status', async (req, res) => {
  const { status } = req.body;
  const VALID = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
  if (!VALID.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  const booking = await prisma.booking.update({
    where: { id: req.params.id },
    data: { status },
    include: { room: true, user: { select: { id: true, name: true, email: true } } },
  });
  return res.json({ ...booking, room: parseRoom(booking.room) });
});

// ── Rooms ─────────────────────────────────────────────────────
router.get('/rooms', async (_req, res) => {
  const rooms = await prisma.room.findMany({ orderBy: { price: 'asc' } });
  return res.json(rooms.map(parseRoom));
});

router.post('/rooms', async (req, res) => {
  const { name, type, description, price, capacity, size, bedType, amenities, images, featured } = req.body;
  const room = await prisma.room.create({
    data: {
      name, type, description,
      price: Number(price), capacity: Number(capacity), size: Number(size),
      bedType, featured: Boolean(featured),
      amenities: JSON.stringify(Array.isArray(amenities) ? amenities : []),
      images:    JSON.stringify(Array.isArray(images)    ? images    : []),
    },
  });
  return res.json(parseRoom(room));
});

router.put('/rooms/:id', async (req, res) => {
  const { name, type, description, price, capacity, size, bedType, amenities, images, featured, available } = req.body;
  const room = await prisma.room.update({
    where: { id: req.params.id },
    data: {
      name, type, description,
      price: Number(price), capacity: Number(capacity), size: Number(size),
      bedType, featured: Boolean(featured), available: Boolean(available),
      amenities: JSON.stringify(Array.isArray(amenities) ? amenities : []),
      images:    JSON.stringify(Array.isArray(images)    ? images    : []),
    },
  });
  return res.json(parseRoom(room));
});

router.patch('/rooms/:id/availability', async (req, res) => {
  const room = await prisma.room.findUnique({ where: { id: req.params.id } });
  if (!room) return res.status(404).json({ error: 'Room not found' });

  const updated = await prisma.room.update({
    where: { id: req.params.id },
    data: { available: !room.available },
  });
  return res.json(parseRoom(updated));
});

router.delete('/rooms/:id', async (req, res) => {
  const bookings = await prisma.booking.count({ where: { roomId: req.params.id, status: 'CONFIRMED' } });
  if (bookings > 0) return res.status(400).json({ error: 'Cannot delete room with active bookings' });

  await prisma.room.delete({ where: { id: req.params.id } });
  return res.json({ success: true });
});

export default router;
