import express from 'express';
const router = express.Router();
import { signup, login } from '../controllers/contractorAuth.js';
import protect from '../middleware/auth.js';

router.post('/contractor-signup', signup);
router.post('/contractor-login', login);

export default router;