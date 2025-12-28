import Leave from '../models/Leave.js'
import Student from '../models/Student.js'
import { jwtDecode } from 'jwt-decode';

export const submitLeave= async(req,res)=>{
  try{
    const {from,to,reason,rollNo}=req.body;
    if(!from || !to || !reason||!rollNo){
      return res.status(400).json({status:'failed',message:"all fileds are required!!"});
    }

    // Get student details
    const student = await Student.findOne({ rollNo });
    if (!student) {
      return res.status(404).json({status:'failed',message:"Student not found"});
    }

    const l= await Leave.create({
      from,
      to,
      reason,
      rollNo,
      studentName: student.fullName,
      hostelName: student.hostelName
    })

    return res.status(201).json({status:'success',message:l})
  }catch(error){
    console.error('Submit leave error:', error);
    return res.status(500).json({status:'failed',message:"network error occured"});
  }
}






export const getLeaveHistory = async (req, res) => {
  try {
    const token = req.headers.authorization; 
    if (!token) return res.status(401).json({ status: 'failed', message: 'Login first' });

    const decoded = jwtDecode(token);
    const rollNo = decoded.rollNo;

    const history = await Leave.find({ rollNo }).sort({ _id: -1 }); // newest first
    return res.status(200).json({
      status: 'success',
      message: 'history fetched successfully',
      data: history,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'failed', message: 'network error occured' });
  }
};

