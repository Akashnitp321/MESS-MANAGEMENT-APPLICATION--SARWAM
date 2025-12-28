import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const ContractorSchema = new mongoose.Schema({
  contractorId: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  companyName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  hostelName: { type: String, required: true },
  isVerified: { type: Boolean, default: false }
});

export default mongoose.model('Contractor', ContractorSchema);