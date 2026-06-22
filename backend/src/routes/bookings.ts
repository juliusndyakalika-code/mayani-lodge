import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

function parseRoom(room: any) {
  return { ...room, amenities: JSON.parse(room.amenities), images: JSON.parse(room.images) };
}

router.use(authenticate);

router.get('/', async (req, res) => {
  const bookings = await prisma.booking.findMany({
    where: { userId: req.user!.userId },
    include: { room: true },
    orderBy: { createdAt: 'desc' },
  });
  return res.json(bookings.map((b) => ({ ...b, room: parseRoom(b.room) })));
});

router.get('/admin/all', requireAdmin, async (req, res) => {
  const bookings = await prisma.booking.findMany({
    include: { room: true, user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return res.json(bookings.map((b) => ({ ...b, room: parseRoom(b.room) })));
});

router.get('/:id', async (req, res) => {
  const booking = await prisma.booking.findFirst({
    where: { id: req.params.id, userId: req.user!.userId },
    include: { room: true },
  });
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  return res.json({ ...booking, room: parseRoom(booking.room) });
});

router.post('/', async (req, res) => {
  const { roomId, checkIn, checkOut, guests, guestName, guestEmail, guestPhone, specialReq } = req.body;
  if (!roomId || !checkIn || !checkOut || !guests || !guestName || !guestEmail || !guestPhone) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const ciDate = new Date(checkIn);
  const coDate = new Date(checkOut);
  if (ciDate >= coDate) return res.status(400).json({ error: 'Check-out must be after check-in' });

  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) return res.status(404).json({ error: 'Room not found' });

  const conflict = await prisma.booking.findFirst({
    where: { roomId, status: { not: 'CANCELLED' }, checkIn: { lt: coDate }, checkOut: { gt: ciDate } },
  });
  if (conflict) return res.status(409).json({ error: 'Room not available for selected dates' });

  const nights = Math.ceil((coDate.getTime() - ciDate.getTime()) / 86400000);
  const booking = await prisma.booking.create({
    data: {
      userId: req.user!.userId,
      roomId,
      checkIn: ciDate,
      checkOut: coDate,
      guests,
      totalPrice: nights * room.price,
      status: 'CONFIRMED',
      guestName,
      guestEmail,
      guestPhone,
      specialReq,
    },
    include: { room: true },
  });

  return res.json({ ...booking, room: parseRoom(booking.room) });
});

router.patch('/:id/cancel', async (req, res) => {
  const booking = await prisma.booking.findFirst({
    where: { id: req.params.id, userId: req.user!.userId },
  });
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  if (booking.status === 'CANCELLED') return res.status(400).json({ error: 'Already cancelled' });

  const updated = await prisma.booking.update({
    where: { id: req.params.id },
    data: { status: 'CANCELLED' },
    include: { room: true },
  });
  return res.json({ ...updated, room: parseRoom(updated.room) });
});

export default router;
