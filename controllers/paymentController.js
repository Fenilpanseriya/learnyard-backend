import { catchAsyncEroor } from "../middleware/catchAsyncError.js";
import User from "../modles/User.js";
import { instance } from "../server.js";
import EroorHandler from "../utils/errorHandler.js";
import Payment from "../modles/Payment.js";
import crypto from"crypto"
import hmac_sha256 from "crypto"
export const buyScubscription=catchAsyncEroor(async(req,res,next)=>{
    const user=await User.findById(req.user._id);
    console.log(user.role);
    if(user.role==="admin"){
        return next(new EroorHandler("admoin cannot buy suubscription"),404);
    }
    const planid=process.env.PLAN_ID;
    const subscription=await instance.subscriptions.create({
        plan_id:planid,
        customer_notify:1,
        total_count:12
    })
    //let id=nanoid(10);
    var options = {
        amount: 3000,  // amount in the smallest currency unit
        currency: "INR",
        receipt: "order_rcptid_11"
      };
      let id;
      let opt=await instance.orders.create(options, function(err, order) {
        console.log("order is "+JSON.stringify(order));
        id=order.id;
    });
    console.log("id is "+ id);
    user.subscription.id=subscription.id;
    user.subscription.status=subscription.status;
    await user.save();
    res.status(201).json({
        success:true,
        subscriptionId:subscription.id,
        order_id:id
    })
})

export const paymentVerify=catchAsyncEroor(async(req,res,next)=>{

    const {razorpay_signature,razorpay_payment_id,razorpay_order_id}=req.body;
    const {order_id}=req.query.order_id;
    console.log(JSON.stringify(req.body))
    console.log(JSON.stringify(req.headers));
    const user=await User.findById(req.user._id);

    const subscriptionId=user.subscription.id;
    //const generated_signature =crypto.createHmac("sha256",process.env.RAZORPAY_SECRET).update(order_id+"|"+razorpay_payment_id,'utf-8').digest("hex")
    //const generated_signature=crypto.createHmac("sha256",process.env.RAZORPAY_SECRET).update(razorpay_payment_id+"|"+subscriptionId,'utf-8').digest("hex")
   
    //const isMatch=generated_signature===razorpay_signature;
    //console.log("generated sig is "+ generated_signature)
    console.log("razorpay signature is "+ razorpay_signature)
    if(!razorpay_signature){
        return res.redirect(`${process.env.FRONTEND_URI}/paymentfail`)
    }
    await Payment.create({razorpay_signature,razorpay_payment_id,razorpay_subscription_id:subscriptionId,})
    user.subscription.status="active"
    await user.save()
    res.redirect(`${process.env.FRONTEND_URI}/paymentsuccess?reference=${razorpay_payment_id}`)
})

export const razorpayKey=catchAsyncEroor(async(req,res,next)=>{
    res.status(200).json({
        "success":true,
        key:process.env.RAZORPAY_KEY
    })
})

export const cancleSubscription=catchAsyncEroor(async(req,res,next)=>{
    const user=await User.findById(req.user._id);
    const subsscriptionid=user.subscription.id;
    let refund=true;
    await instance.subscriptions.cancel(subsscriptionid);
    const payment=await Payment.findOne({
        razorpay_subscription_id:subsscriptionid
    })
    console.log("payment is "+payment);
    const gap=Date.now()-payment?.createdAt;
    const refundTime=process.env.REFUND_DAYS*24*60*60*1000
    if(gap<refundTime){
        refund=true
        await instance.payments.refund(payment.razorpay_payment_id);
    }
    await Payment.deleteOne(payment)
    user.subscription.id=undefined;
    user.subscription.status=undefined;
    await user.save();
    
    res.status(200).json({
        "success":true,
        "message":refund?"subscription cancle , you will recieve full refund with in 7 days":"subscription cancled , no refaund initiated as subscription was canclled after 7 days"
    
    })
})