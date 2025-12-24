const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const StudentSchema = new mongoose.Schema({
  email:{ type: String, required: true },
  rollNo: { type: String, required: true },
  fullName: { type: String, required: true },
  instituteName: { type: String, required: true },
  password: { type: String, required: true },
  hostelName: { type: String, required: true },
  passportPhotoLink: { type: String, required: true },
  idCardPhotoLink: { type: String, required: true },
  isVerified:{type:Boolean,default:false}
});



module.exports = mongoose.model('Student', StudentSchema);
