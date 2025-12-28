import jwt from 'jsonwebtoken';
import Student from '../models/Student.js';
import Contractor from '../models/Contractor.js';
import dotenv from 'dotenv';

dotenv.config();

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) return res.status(401).json({ message: "Not authorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Try to find user as student first
    let user = await Student.findById(decoded.id).select("-password");

    // If not found as student, try as contractor
    if (!user) {
      user = await Contractor.findById(decoded.id).select("-password");
      if (user) {
        req.contractor = user;
      }
    } else {
      req.student = user;
    }

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    next();
  } catch (err) {
    res.status(401).json({ message: "Token invalid" });
  }
};

export default protect;
