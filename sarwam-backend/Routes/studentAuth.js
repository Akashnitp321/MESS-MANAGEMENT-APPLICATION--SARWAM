import express from 'express';
const router = express.Router();
import { signup, login } from '../controllers/studentAuth.js';
import protect from '../middleware/auth.js';

router.post('/student-signup', signup);
router.post('/student-login', login);

export default router;
