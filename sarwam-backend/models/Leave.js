import mongoose from "mongoose";

const LeaveSchema= new mongoose.Schema({
    rollNo:{type:String,required:true},
    studentName:{type:String,required:true},
    hostelName:{type:String,required:true},
    from:{type:String,required:true},
    to:{type:String,required:true},
    reason:{type:String,required:true},
    status:{type:String,default:'pending',enum:['pending','approved','rejected']}
})

export default mongoose.model("leave",LeaveSchema)





