import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';
import { validateLogin, validateRegister } from '../validators/authValidator.js';

const router = express.Router();

router.post('/signup', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', verifyToken, getMe);

export default router;
