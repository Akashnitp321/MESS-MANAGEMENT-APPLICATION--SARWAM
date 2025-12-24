import express from 'express';
import { getMenu } from '../controllers/MenuController.js';

const router = express.Router();


router.post('/mess/today', getMenu);

export default router;