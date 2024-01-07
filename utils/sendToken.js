import { client } from "../server.js";
import EroorHandler from "./errorHandler.js";

export const sendToken=(res,user1,message,statusCode,next)=>{
console.log("in sendtoken")
const token=user1.getJWTToken()
const options={
    expires:new Date(Date.now()+15*24*60*60*1000),
    httpOnly:true,
    // secure:true,
    sameSite:"none"
}
    if(token){
        try{
            console.log("token in sendtoken "+token)
            user1.token=token;
            user1.save();
            //client.set(user1._id,user1,1800);
            console.log("user is * "+user1)
            res.status(statusCode).cookie("token",token,options).json({
                success:true,
                message,
                user1,token
            })

        }
        catch(e){
                return next(new EroorHandler("creation fail in sendtoken function"),400)
        }

    }else{
        return next(new EroorHandler("creation fail due to token is not get"),400)
    }
    
}