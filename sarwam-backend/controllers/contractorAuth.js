import Contractor from '../models/Contractor.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// JWT token generator
const generateToken = (id, contractorId) => {
  return jwt.sign({ id, contractorId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '1d'
  });
};

// ----------------- SIGNUP -----------------
export const signup = async (req, res) => {
  try {
    const { contractorId, email, fullName, password, companyName, phoneNumber, hostelName } = req.body;

    // Ensure required fields are provided
    const missing = [];
    if (!email) missing.push('email');
    if (!contractorId) missing.push('contractorId');
    if (!password) missing.push('password');
    if (missing.length) {
      return res.status(400).json({ error: 'Missing required fields', missing });
    }

    // Check if contractor already exists
    const existingContractor = await Contractor.findOne({ contractorId });
    if (existingContractor) {
      return res.status(409).json({ error: 'Contractor ID already exists. Please Login' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create contractor
    const contractor = await Contractor.create({
      contractorId,
      email,
      fullName,
      password: hashedPassword,
      companyName,
      phoneNumber,
      hostelName
    });

    const token = generateToken(contractor._id, contractor.contractorId);

    return res.status(201).json({ contractor, token });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
};

// ----------------- LOGIN -----------------
export const login = async (req, res) => {
  try {
    const { contractorId, password, hostel } = req.body;

    const contractor = await Contractor.findOne({ contractorId });
    if (!contractor) {
      return res.status(404).json({ error: 'Invalid contractor ID or password' });
    }

    // Check if the selected hostel matches the contractor's assigned hostel
    if (contractor.hostelName !== hostel) {
      return res.status(403).json({ error: 'You are not authorized to access this hostel' });
    }

    const isMatch = await bcrypt.compare(password, contractor.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid contractor ID or password' });
    }

    const token = generateToken(contractor._id, contractor.contractorId);

    res.status(200).json({ contractor, token, hostel });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
};