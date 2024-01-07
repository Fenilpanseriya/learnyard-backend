import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import validator from "validator";
import bcrypt from "bcrypt"  
import crypto from "crypto"
const schema=mongoose.Schema({
    name:{
        required:[true,"Please Enter Your name"],
        type:String
    },
    email:{
        type:String,
        required:[true,"Please Enter Your email"],
        unique:true,
        validate:validator.isEmail
    },
    password:{
        type:String,
        required:[true,"Please Enter Your password"],
        unique:true,
        minLength:[6,"  Please password at least of 6 character"],
        select:false
    },
    role:{
        type:String,
        
        default:"user"
    },
    subscription:{
        id:String,
        status:String
    },
    avatar:{
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }

    },
    playlist:[
        {
            course:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"Course"
            },
            poster:String,
        }
    ],
    createdAt:{
        type:Date,
        default:Date.now()
    },
    ResetPasswordToken:String,
    ResetPasswordExpire:String,
    token:{
        type:String,
        default:""
    }
    
})
schema.methods.getJWTToken=function(){
    return jwt.sign({_id:this._id},process.env.JWT_SECRET,{
        expiresIn:"15d"
    })
}
schema.pre("save",async function(next){
    if(!this.isModified("password")){
        next();
    }
    this.password=await bcrypt.hash(this.password,10);
    
    next();
})
schema.methods.comparePassword=async function(password){
    console.log(this.password);
    console.log(password);
   const bool=await bcrypt.compare(password,this.password)
   console.log(bool);
   return bool;
}

schema.methods.getResetToken=async function(){
    const resetToken=crypto.randomBytes(20).toString("hex")
    this.ResetPasswordToken=crypto.createHash('sha256').update(resetToken).digest("hex");
    this.ResetPasswordExpire=Date.now()+15*60*1000;
    return resetToken;
}
const User=mongoose.model("User",schema);
export default User