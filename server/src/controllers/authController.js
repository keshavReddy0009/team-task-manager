import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

const createToken = (payload) => {
  const secret = process.env.JWT_SECRET || 'secret';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
};

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: 'MEMBER'
    }
  });

  const token = createToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  });

  res.status(201).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    token
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = createToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  });

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    token
  });
};

export const getMe = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({ user });
};
