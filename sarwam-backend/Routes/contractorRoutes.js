import express from 'express';
const router = express.Router();
import { getStudentsByHostel, approveStudent, rejectStudent, getPurchaseAnalytics, getLeaveApplications, approveLeave, rejectLeave } from '../controllers/contractorController.js';
import protect from '../middleware/auth.js';

// All contractor routes require authentication
router.use(protect);

router.get('/students', getStudentsByHostel);
router.put('/approve-student/:studentId', approveStudent);
router.put('/reject-student/:studentId', rejectStudent);
router.get('/purchase-analytics', getPurchaseAnalytics);
router.get('/leaves', getLeaveApplications);
router.put('/approve-leave/:leaveId', approveLeave);
router.put('/reject-leave/:leaveId', rejectLeave);

export default router;