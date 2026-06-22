import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

function parseRoom(room: any) {
  return { ...room, amenities: JSON.parse(room.amenities), images: JSON.parse(room.images) };
}

router.get('/', async (req, res) => {
  const { type, minPrice, maxPrice, capacity, checkIn, checkOut, featured } = req.query;

  const where: any = { available: true };
  if (type) where.type = type;
  if (featured === 'true') where.featured = true;
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }
  if (capacity) where.capacity = { gte: Number(capacity) };

  let rooms = await prisma.room.findMany({ where, orderBy: { price: 'asc' } });

  if (checkIn && checkOut) {
    const ciDate = new Date(checkIn as string);
    const coDate = new Date(checkOut as string);
    const busy = await prisma.booking.findMany({
      where: { status: { not: 'CANCELLED' }, checkIn: { lt: coDate }, checkOut: { gt: ciDate } },
      select: { roomId: true },
    });
    const busyIds = new Set(busy.map((b) => b.roomId));
    rooms = rooms.filter((r) => !busyIds.has(r.id));
  }

  return res.json(rooms.map(parseRoom));
});

router.get('/:id', async (req, res) => {
  const room = await prisma.room.findUnique({ where: { id: req.params.id } });
  if (!room) return res.status(404).json({ error: 'Room not found' });
  return res.json(parseRoom(room));
});

router.get('/:id/availability', async (req, res) => {
  const { checkIn, checkOut } = req.query;
  if (!checkIn || !checkOut) return res.status(400).json({ error: 'Dates required' });

  const conflict = await prisma.booking.findFirst({
    where: {
      roomId: req.params.id,
      status: { not: 'CANCELLED' },
      checkIn: { lt: new Date(checkOut as string) },
      checkOut: { gt: new Date(checkIn as string) },
    },
  });

  return res.json({ available: !conflict });
});

export default router;
