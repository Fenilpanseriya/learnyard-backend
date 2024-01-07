import mongoose from "mongoose";

const schema=mongoose.Schema({
    user:{
        type:Number,
        default:0
    },
    subscription:{
        type:Number,
        default:0
    },
    views:{
        type:Number,
        default:0
    },
    createdAt:{
        type:Date,
        default:Date.now()
    }

})
const  State=mongoose.model("State",schema);
export default State;