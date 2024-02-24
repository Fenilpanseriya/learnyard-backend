import express from "express"
import { config } from "dotenv"
import course from "./routes/courseRoutes.js"
import users from "./routes/userRoutes.js"
import other from "./routes/other.js"
import payment from "./routes/paymentRoutes.js"
import errorMiddleware from "./middleware/errorMiddleware.js"
import cors from "cors";
import cookieParser from "cookie-parser"

const app=express();
config({
    path:"./config/config.env"
})
app.use(express.json())
app.use(express.urlencoded({
    extended:true,
}))
const options={
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": true,
    "optionsSuccessStatus": 204,
    
    
}
//app.options("*",cors({origin:"*",optionsSuccessStatus:200,credentials:true}))
app.use(cookieParser());
// app.use(cors({
//     origin:["http://localhost:3000"],
//     methods:["GET","POST","DELETE","PUT"]
// }))
app.use(cors({
    origin:"http://localhost:3001/",
    credentials:true,
    methods:["GET","DELETE","PUT","POST"]
    
}))
app.use("/api/v1",course);
app.use("/api/v1",users)
app.use("/api/v1",payment);
app.use("/api/v1",other);
export default app;
app.use(errorMiddleware);