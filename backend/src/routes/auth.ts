import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();
const secret = () => process.env.JWT_SECRET || 'secret';

router.post('/register', async (req, res) => {
  const { email, password, name, phone } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password and name are required' });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(400).json({ error: 'Email already registered' });

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, password: hashed, name, phone } });

  const token = jwt.sign({ userId: user.id, role: user.role }, secret(), { expiresIn: '7d' });
  return res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, secret(), { expiresIn: '7d' });
  return res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

router.get('/me', authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, email: true, name: true, phone: true, role: true },
  });
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json(user);
});

export default router;
