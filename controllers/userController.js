import { catchAsyncEroor } from "../middleware/catchAsyncError.js"
import User from "../modles/User.js";
import Course from "../modles/Course.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sendEmail } from "../utils/sendEmail.js";
import { sendToken } from "../utils/sendToken.js";
import crypto from "crypto";
import cloudinary from "cloudinary"
import getDataUri from "../utils/DtaUri.js";
import State from "../modles/Stats.js";
import { client } from "../server.js";


export const registerUser=catchAsyncEroor(async(req,res,next)=>{
    const {name,email,password}=req.body;
    const file=req.file;
    console.log("body is "+name,email,password)
    if(!name|| !email || !password || !file){
        return next(new ErrorHandler("please enter all fields "))
    }
    client.del("users")

    let user=await  User.findOne({email});
    if(user){
        return next(new ErrorHandler("User Already Exists...",409));
    }
    //upload file on cloudinary
    
    console.log("file"+file);
    const fileUri=getDataUri(file);
    //console.log(fileUri.content);
    const mycloud=await cloudinary.v2.uploader.upload(fileUri.content);
    console.log("public id"+mycloud.public_id)
    let user1;
    try{
         user1=await User.create({name,role:"user",email,password,avatar:{
            public_id:mycloud.public_id,
            url:mycloud.secure_url
        },token:""})
        console.log("user is "+user1)
       

    }
    catch(e){
        console.log("e is "+e)
        next(new ErrorHandler(e),400)
    }
    if(user1){
        sendToken(res,user1,"Registered Successfully",201,next);
    }
    else{
        next(new ErrorHandler("user1 not created"),400)
    }
    
})

export const loginUser=catchAsyncEroor(async(req,res,next)=>{
    const {email,password}=req.body;
    //const file=req.file;
    if(!email ||!password){
        return next(new ErrorHandler("please enter all fields "))
    }
    let user=await  User.findOne({email}).select("+password")
    console.log(user)
    if(!user){
        return next(new ErrorHandler("User is Not exist Exists please signup first...",401));
    }
    const isMatch=await user.comparePassword(password);
    if(!isMatch){
        return next(new ErrorHandler("Incorrect email/password...",401));
    }
    console.log("user is "+user)
    console.log("req cookie is "+JSON.stringify(res.cookie))
    sendToken(res,user,`welcome back ${user.name}`,201);
    
})

export const logoutUser=catchAsyncEroor(async(req,res,next)=>{
    res.clearCookie('token');
    const token=req.headers.token;
    const user=await User.findOne({token});
    user.token=null;
    user.save();
    res.status(200).cookie({
        "expires":Date(Date.now()+7*24*60*60*1000),
        httpOnly:true,
        sameSite:"none"

    }).json({
        "success":true,
        "message":"Logedout successfully.."
    })
})

export const getMyProfile=catchAsyncEroor(async(req,res,next)=>{
    const user=await User.findById(req.user._id);
    res.status(200).json({
        "success":true,
        user
    })
})

export const changePassword=catchAsyncEroor(async(req,res,next)=>{
    const {oldpassword,newpassword}=req.body;
    if(!oldpassword || !newpassword){
        return next(new ErrorHandler("please enter all fields "),400)
    }
    const user=await User.findById(req.user._id).select("+password");
    const isMatch=await user.comparePassword(oldpassword);
    if(!isMatch){
        return next(new ErrorHandler("please enter  ficorrect old password "))
    }
    user.password=newpassword;
    await user.save();
    res.status(200).json({
        "success":true,
        "message":"password changed successfully"
       })
})

export const changeProfile=catchAsyncEroor(async(req,res,next)=>{
    const {name,email,password,}=req.body;
    const file=req.file 
    if(!name || !email ||!password || !file){
        return next(new ErrorHandler("please enter all fields "),400)
    }
    
    const user=await User.findById(req.user._id).select("+password");
    
    user.name=name;
    user.email=email;
    user.password=password;
    const fileUri=getDataUri(file);
    //console.log(fileUri.content);
    const mycloud=await cloudinary.v2.uploader.upload(fileUri.content);
    console.log(mycloud);
    //await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    user.avatar={
        public_id:mycloud.public_id,
        url:mycloud.secure_url
    }
    console.log(user.avatar)
    try{
        await user.save();

    }catch(e){
        console.log(e);
    }
   
    console.log("new user "+ user);
    res.status(200).json({
        "success":true,
        "message":"profilr updated  successfully",
        user
       })
})

export const changeProfilePicture=catchAsyncEroor(async(req,res,next)=>{
    const user=await User.findById(req.user._id)
    const file=req.file;
    //console.log(file);
    const fileUri=getDataUri(file);
    //console.log(fileUri.content);
    const mycloud=await cloudinary.v2.uploader.upload(fileUri.content);
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    user.avatar={
        public_id:mycloud.public_id,
        url:mycloud.secure_url
    }
    console.log(user.avatar)
    try{
        await user.save();

    }catch(e){
        console.log(e);
    }
    res.status(200).json({
        "success":true,
        "message":"update profilepicture successfully",
        user
    })

})

export const forgetPassword=catchAsyncEroor(async(req,res,next)=>{
    const {email}=req.body;
    let user=await User.findOne({email})
    if(!user){
        return next(new ErrorHandler("user not found",400));
    }
    console.log("user in forget password "+user);
    const resetToken=await user.getResetToken();
    await user.save(); 
    const url=`${process.env.FRONTEND_URI}/resetpassword/${resetToken}`
    const message=`Click on the link to reset your paassword .${url}. if you have not request than Please ignore`
    await sendEmail(user.email,"Learnyard Reset password",message)
    res.status(200).json({
        "success":true,
        "message":`Resert link sent on ${email}`,
        "resetToken":resetToken
       })
})

export const resetPassword=catchAsyncEroor(async(req,res,next)=>{
    const {token}=req.params;
    console.log("token "+token);
    const resetPasswordToken=crypto.createHash('sha256').update(token).digest("hex");
    console.log("reset "+token,resetPasswordToken)
    const user=await User.findOne({ResetPasswordToken:resetPasswordToken,ResetPasswordExpire:{
        $gt:Date.now()
    }})
    if(!user){
        return next(new ErrorHandler("token is invalid/has been expired"),400);
    }
    user.password=req.body.password;
    user.ResetPasswordExpire=undefined;
    user.ResetPasswordToken=undefined;
    await user.save();

    res.status(200).json({
        "success":true,
        "message":"password updated  successfully"
    })
})

export const addToPlaylist=catchAsyncEroor(async(req,res,next)=>{
    console.log("in add")
    const user=await User.findById(req.user._id);

    const course=await Course.findById(req.body.id);

    if(!course){
        return next(new ErrorHandler("invalid course id"),400)
    }
    const isExist=user.playlist.find((item)=>(item.course.toString()===course._id.toString()))
    if(isExist){
        return next(new ErrorHandler("already present in playlist"),400)
    }
    user.playlist.push({
        course:course._id,
        poster:course.poster.url
    })
    let title=course.title;
    await user.save();
    res.status(200).json({
        "message":"added to playlist",
        user,
        title
    })
})
export const removeFromPlaylist=catchAsyncEroor(async(req,res,next)=>{
    const user=await User.findById(req.user._id);

    const course=await Course.findById(req.body.id);

    if(!course){
        return next(new ErrorHandler("invalid course id"),400)
    }
    
    const newPlaylist=user.playlist.filter((item)=>item.course.toString()!==course._id.toString());
    user.playlist=newPlaylist;
    await user.save();
    res.status(200).json({
        "message":"removed from playlist",
        
    })
})

export const getAllUsers=catchAsyncEroor(async(req,res,next)=>{
        const users=await User.find({});
        //client.set("users",users,600)
        res.status(200).json({
            "success":true,
            users
        })

    
    
})

export const updateUserRole=catchAsyncEroor(async(req,res,next)=>{
    const id=req.params.id;
    console.log(id);
    const user=await User.findById(id);
    if(!user){
        return next(new ErrorHandler("user not exist"),400)
    }
    client.del("users")
    if(user.role==="user"){
        user.role="admin"
    }
    else{
        user.role="user";
    }
    await user.save();
    res.status(200).json({
        "success":true,
        "role":user.role,
        "message":"role updated"
    })
})
export const deleteUser=catchAsyncEroor(async(req,res,next)=>{
    const user=await User.findById(req.params.id);
    if(!user){
        return next(new ErrorHandler("user not exist"),400)
    }
    await cloudinary.v2.uploader.destroy(user.avatar.public_id)
    
    await user.deleteOne({_id:req.params.id});
    
    res.status(200).json({
        "success":true,
        "message":"user deleted"
    })
})

export const deleteMyProfile=catchAsyncEroor(async(req,res,next)=>{
    const user=await User.findById(req.user._id);
    if(!user){
        return next(new ErrorHandler("user not exist"),400)
    }
    await cloudinary.v2.uploader.destroy(user.avatar.public_id)
    
    await user.deleteOne(req.user._id);
    
    res.status(200).cookie("token",null,{
        expires:new Date(Date.now())
    }).json({
        "success":true,
        "message":"profile deleted"
    })
})


User.watch().on("change",async()=>{
    const stats=await State.find().sort({createdAt:-1}).limit(1);
    const activeSubscriptionUser=await User.find({"subscription.status":"active"});//array
    console.log("active user "+activeSubscriptionUser)
    console.log("active user length "+activeSubscriptionUser.length)
    stats[0].subscription=activeSubscriptionUser.length;
    stats[0].user=await User.countDocuments();
    console.log("total user is "+stats.user)
    stats.createdAt=new Date(Date.now());
    await stats[0].save();
    console.log("after modify "+stats)
})