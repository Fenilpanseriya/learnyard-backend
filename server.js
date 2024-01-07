import "./app.js"
import app from "./app.js"
import { connectDb } from "./config/database.js"
import cloudinary from "cloudinary"
import Razorpay from "razorpay"
import nodeCron from "node-cron"
import State from "./modles/Stats.js"
import NodeCache from "node-cache"
import * as dotenv from "dotenv"
dotenv.config();
connectDb();

cloudinary.v2.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.API_KEY,
    api_secret:process.env.API_SECRET
})
export const client=new NodeCache({stdTTL:600})
export const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
  });
  console.log("instance is "+JSON.stringify(instance))

nodeCron.schedule("0 0 0 1 * *",async()=>{
    try{
        await State.create()
    }
    catch(e){
        console.log(e);
    }
})




app.listen(process.env.PORT,()=>{
    console.log("server run at "+ process.env.PORT)
})
