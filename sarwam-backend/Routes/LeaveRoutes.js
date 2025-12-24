import express from 'express';
import { submitLeave,getLeaveHistory } from '../controllers/LeaveController.js';


const router = express.Router();


router.post('/submit/leave', submitLeave);
router.get('/history/me',getLeaveHistory)

export default router;