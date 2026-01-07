import mongoose from "mongoose";

const organizerSchema=new mongoose.Schema({
    name: {type:String , required:true },
    email: {type:String, required:true , unique:true },
    username: {type:String, required:true , unique:true},
    Orgname: {type:String, required:true },
    password: {type:String, required:true},
    createdAt: {type:Date , default:Date.now()}
});

export default mongoose.model("Organizer",organizerSchema);