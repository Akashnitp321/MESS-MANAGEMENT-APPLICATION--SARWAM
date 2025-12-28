import Student from '../models/Student.js';
import Contractor from '../models/Contractor.js';
import Purchase from '../models/Purchase.js';
import Leave from '../models/Leave.js';

// Get students from contractor's hostel
export const getStudentsByHostel = async (req, res) => {
  try {
    // Check if user is authenticated as contractor
    if (!req.contractor) {
      return res.status(403).json({ error: 'Access denied. Contractor authentication required.' });
    }

    const hostel = req.contractor.hostelName;

    const students = await Student.find({ hostelName: hostel }).select('-password');

    res.status(200).json({ students });
  } catch (err) {
    console.error('Get students error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get leave applications for contractor's hostel
export const getLeaveApplications = async (req, res) => {
  try {
    if (!req.contractor) {
      return res.status(403).json({ error: 'Access denied. Contractor authentication required.' });
    }

    const hostelName = req.contractor.hostelName;

    // Find all leave applications for students in this hostel
    const leaves = await Leave.find({ hostelName }).sort({ _id: -1 });

    res.status(200).json({ leaves });
  } catch (err) {
    console.error('Get leave applications error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Approve leave application
export const approveLeave = async (req, res) => {
  try {
    if (!req.contractor) {
      return res.status(403).json({ error: 'Access denied. Contractor authentication required.' });
    }

    const { leaveId } = req.params;

    const leave = await Leave.findById(leaveId);
    if (!leave) {
      return res.status(404).json({ error: 'Leave application not found' });
    }

    // Check if leave is from contractor's hostel
    if (leave.hostelName !== req.contractor.hostelName) {
      return res.status(403).json({ error: 'You can only manage leaves from your assigned hostel' });
    }

    const updatedLeave = await Leave.findByIdAndUpdate(
      leaveId,
      { status: 'approved' },
      { new: true }
    );

    res.status(200).json({ leave: updatedLeave, message: 'Leave approved successfully' });
  } catch (err) {
    console.error('Approve leave error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Reject leave application
export const rejectLeave = async (req, res) => {
  try {
    if (!req.contractor) {
      return res.status(403).json({ error: 'Access denied. Contractor authentication required.' });
    }

    const { leaveId } = req.params;

    const leave = await Leave.findById(leaveId);
    if (!leave) {
      return res.status(404).json({ error: 'Leave application not found' });
    }

    // Check if leave is from contractor's hostel
    if (leave.hostelName !== req.contractor.hostelName) {
      return res.status(403).json({ error: 'You can only manage leaves from your assigned hostel' });
    }

    const updatedLeave = await Leave.findByIdAndUpdate(
      leaveId,
      { status: 'rejected' },
      { new: true }
    );

    res.status(200).json({ leave: updatedLeave, message: 'Leave rejected successfully' });
  } catch (err) {
    console.error('Reject leave error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Approve student (set isVerified to true)
export const approveStudent = async (req, res) => {
  try {
    // Check if user is authenticated as contractor
    if (!req.contractor) {
      return res.status(403).json({ error: 'Access denied. Contractor authentication required.' });
    }

    const { studentId } = req.params;

    // Find the student first to check if they're in the contractor's hostel
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Check if student is in contractor's hostel
    if (student.hostelName !== req.contractor.hostelName) {
      return res.status(403).json({ error: 'You can only manage students from your assigned hostel' });
    }

    // Update student verification status
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      { isVerified: true },
      { new: true }
    ).select('-password');

    res.status(200).json({ student: updatedStudent, message: 'Student approved successfully' });
  } catch (err) {
    console.error('Approve student error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Reject student (set isVerified to false)
export const rejectStudent = async (req, res) => {
  try {
    // Check if user is authenticated as contractor
    if (!req.contractor) {
      return res.status(403).json({ error: 'Access denied. Contractor authentication required.' });
    }

    const { studentId } = req.params;

    // Find the student first to check if they're in the contractor's hostel
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Check if student is in contractor's hostel
    if (student.hostelName !== req.contractor.hostelName) {
      return res.status(403).json({ error: 'You can only manage students from your assigned hostel' });
    }

    // Update student verification status
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      { isVerified: false },
      { new: true }
    ).select('-password');

    res.status(200).json({ student: updatedStudent, message: 'Student rejected successfully' });
  } catch (err) {
    console.error('Reject student error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get purchase analytics for contractor's hostel
export const getPurchaseAnalytics = async (req, res) => {
  try {
    // Check if user is authenticated as contractor
    if (!req.contractor) {
      return res.status(403).json({ error: 'Access denied. Contractor authentication required.' });
    }

    const hostelName = req.contractor.hostelName;

    // Get current month
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Find all students in the contractor's hostel
    const students = await Student.find({ hostelName });
    const studentIds = students.map(student => student.rollNo);

    // Aggregate purchases for this month
    const purchases = await Purchase.find({
      studentId: { $in: studentIds },
      month: currentMonth
    });

    console.log(`Found ${purchases.length} purchases for ${hostelName} in ${currentMonth}`);
    console.log('Student IDs:', studentIds);

    // Group by item name and calculate totals
    const analytics = {};
    purchases.forEach(purchase => {
      purchase.items.forEach(item => {
        if (!analytics[item.name]) {
          analytics[item.name] = {
            name: item.name,
            quantity: 0,
            totalRevenue: 0
          };
        }
        analytics[item.name].quantity += item.quantity;
        analytics[item.name].totalRevenue += item.price * item.quantity;
      });
    });

    // Convert to array and sort by quantity
    const analyticsArray = Object.values(analytics).sort((a, b) => b.quantity - a.quantity);

    res.status(200).json({ analytics: analyticsArray });
  } catch (err) {
    console.error('Get purchase analytics error:', err);
    res.status(500).json({ error: err.message });
  }
};