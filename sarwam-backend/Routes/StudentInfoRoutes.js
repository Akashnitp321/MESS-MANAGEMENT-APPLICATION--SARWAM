import express from 'express';
import { getInfo } from '../controllers/StudentInfoController.js'; 

const router = express.Router();

router.get('/info/me', getInfo);

export default router;
