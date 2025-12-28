import Student from '../models/Student.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// JWT token generator — now includes rollNo
const generateToken = (id, rollNo) => {
  return jwt.sign({ id, rollNo }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '1d'
  });
};

// ----------------- SIGNUP -----------------
export const signup = async (req, res) => {
  try {
    const { rollNo, email, fullName, instituteName, password, hostelName, passportPhotoLink, idCardPhotoLink } = req.body;

    // Ensure required fields are provided
    const missing = [];
    if (!email) missing.push('email');
    if (!rollNo) missing.push('rollNo');
    if (!password) missing.push('password');
    if (missing.length) {
      return res.status(400).json({ error: 'Missing required fields', missing });
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({ rollNo });
    if (existingStudent) {
      return res.status(409).json({ error: 'Roll number already exists.please Login' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create student
    const student = await Student.create({
      email,
      rollNo,
      fullName,
      instituteName,
      password: hashedPassword,
      hostelName,
      passportPhotoLink,
      idCardPhotoLink
    });

    const token = generateToken(student._id, student.rollNo);

    return res.status(201).json({ student, token });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
};

// ----------------- LOGIN -----------------
export const login = async (req, res) => {
  try {
    const { rollNo, password } = req.body;

    const student = await Student.findOne({ rollNo });
    if (!student) {
      return res.status(404).json({ error: 'Invalid roll number or password' });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid roll number or password' });
    }

    // Check if student is verified
    if (!student.isVerified) {
      return res.status(403).json({
        error: 'You are not verified yet. Contact Hostel Management Committee.'
      });
    }

    const token = generateToken(student._id, student.rollNo);

    res.status(200).json({ student, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
};
