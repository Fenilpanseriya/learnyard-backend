import { catchAsyncEroor } from "../middleware/catchAsyncError.js";
import EroorHandler from "../utils/errorHandler.js";
import { sendEmail } from "../utils/sendEmail.js";
import State from "../modles/Stats.js"

export const contact=catchAsyncEroor(async(req,res,next)=>{
    const {name,email,message}=req.body;
    if(!name  || !email || !message){
        return next(new EroorHandler("all field required "),400);
    }
    const subject="Contact from Learyard";
    const text=`i am ${name} . my e-mail is ${email} . ${message}`;

    await sendEmail(process.env.MAIL,subject,text)
    res.status(200).json({
        message:"your message has been sent to Admin"
    })

})
export const courseRequest=catchAsyncEroor(async(req,res,next)=>{
    const {name,email,course}=req.body;
    if(!name  || !email || !course){
        return next(new EroorHandler("all field required "),400);
    }
    const subject="reqest of course on Learnyard";
    const text=`i am ${name} . my e-mail is ${email} . ${course}`;

    await sendEmail(process.env.MAIL,subject,text)
    res.status(200).json({
        "success":true,
        "message":"your course request has been sent to Admin"
    })
    
})
export const getDashboard=catchAsyncEroor(async(req,res,next)=>{
    const states=await State.find({}).sort({createdAt:1}).limit(12);
    const statsData=[];
    const require=12-states.length;
    
    for(let i=0;i<require;i++){
        statsData.push({
            user:0,
            subscriptions:0,
            views:0
        });
    }
    for(let i=0;i<states.length;i++){
        statsData.push(states[i]);
    }
    console.log("---------------")
    console.log("cuurent data is "+statsData);
    console.log("---------------")
    let usercnt=statsData[11].user;
    let subscriptioncnt=statsData[11].subscription;
    let viewscnt=statsData[11].views;
    let userPer=0,subscriptionPer=0,viewPer=0;

    let userProfit=true,viewsProfit=true,subscriptionProfit=true;
    if(statsData[10].user===0){
        userPer=usercnt*100;
    }
    if(statsData[10].views===0){
        viewPer=viewscnt*100;
    }
    if(statsData[10].subscriptions===0){
        subscriptionPer=subscriptioncnt*100;
    }
    else{
        const diff={
            user:statsData[11].user-statsData[10].user,
            views:statsData[11].views-statsData[10].views,
            subscriptions:statsData[11].subscriptions-statsData[10].subscriptions
        }
        userPer=(diff.user/statsData[10].user)*100;

        viewPer=(diff.views/statsData[10].views)*100;
        subscriptionPer=(diff.subscriptions/statsData[10].subscriptions)*100;
        if(userPer<0)userProfit=false;
        if(viewPer<0)viewsProfit=false;
        if(subscriptionPer<0)subscriptionProfit=false
    }
    res.status(200).json({
        "success":true,
        stats:statsData,
        usercnt,
        subscriptioncnt,
        viewscnt,
        subscriptionPer,
        userPer,
        viewPer,
        userProfit,
        viewsProfit,
        subscriptionProfit
    })
})