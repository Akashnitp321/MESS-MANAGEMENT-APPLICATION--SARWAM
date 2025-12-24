import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
   rollNo:{type:'string',required:true},
   amount:{type:Number,required:true}
});

export default mongoose.model("Payment",PaymentSchema);
