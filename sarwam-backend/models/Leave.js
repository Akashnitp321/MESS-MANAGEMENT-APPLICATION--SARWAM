import mongoose from "mongoose";

const LeaveSchema= new mongoose.Schema({
    rollNo:{type:String,required:true},
    from:{type:String,required:true},
    to:{type:String,required:true},
    reason:{type:String,required:true},
    status:{type:Boolean,default:false}
})

export default mongoose.model("leave",LeaveSchema)





