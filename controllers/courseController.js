import { catchAsyncEroor } from "../middleware/catchAsyncError.js"
import Course from "../modles/Course.js"
import getDataUri from "../utils/DtaUri.js";
import ErrorHandler from "../utils/errorHandler.js";
import cloudinary from"cloudinary"
import State from "../modles/Stats.js";
import mongoose, { Schema } from "mongoose";
import { client } from "../server.js";

export const getAllCourse=catchAsyncEroor(
    async(req,res,next)=>{

        let keyword=(req.query.keyword  || "");
        let category=req.query.category || "";
        console.log("keyword "+keyword)
        console.log("category "+category)
        keyword=toString(keyword).toLowerCase()
        category=toString(category).toLowerCase()
        if(client.has("courses")){
            const courses=await client.get(`courses ${category} ${keyword}`);
            return res.status(200).json({
                success:true,
                courses
            })
            
        }
        else{
            const courses=await Course.find({
                title:{
                    $regex:keyword,
                    $options:"i"
                },
                category:{
                    $regex:category,
                    $options:"i"
                }
            }).select("-lectures");
            client.set(`courses ${category} ${keyword}`,courses,600)
            return res.status(200).json({
                success:true,
                courses
            })

        }
                

    }
)

export const createCourse=catchAsyncEroor(
    async(req,res,next)=>{
        const {title,description,category,createdBy}=req.body;
        if(!title || !description || !createdBy || !category){
            return next(new ErrorHandler("please add all fields ",400));
        }
        const file=req.file;
        console.log(file);
        const fileUri=getDataUri(file);
        //console.log(fileUri.content);
        const mycloud=await cloudinary.v2.uploader.upload(fileUri.content);
        await Course.create({title,description,category,createdBy,poster:{
            public_id:mycloud.public_id,
            url:mycloud.secure_url 
        }})
        //secure_url will give poster's url
        client.del("courses");
        res.status(201).json({//created successfully
            "success":true,
            "message":"course created successfully..."
        })
    }
)

export const getAllCourselactures=catchAsyncEroor(
    async(req,res,next)=>{
        let ObjectId=Schema.ObjectId;
        let id=req.params.id
        console.log("course id is "+id)
        const course=await Course.findById(id);
        if(!course){
            return next(new ErrorHandler("course not found"),400);
        }
        course.views+=1;
        await course.save();
        res.status(200).json({
            "success":true,
            lectures:course.lectures
        })
    }
)

export const addCourselactures=catchAsyncEroor(
    async(req,res,next)=>{
        const {id}=req.params.id
        const {title,discription}=req.body
    
        const course=await Course.findById(req.params.id);
        if(!course){
            return next(new ErrorHandler("course not found"),400);
        }
        const file=req.file;
        console.log(file);
        const fileUri=getDataUri(file);
        //console.log(fileUri.content);
        const mycloud=await cloudinary.v2.uploader.upload_large(fileUri.content,{
            resource_type:"video"
        });
        console.log("my cloud is "+JSON.stringify(mycloud));
        course.lectures.push({
            title,
            description:discription,
            video:{
                public_id:mycloud.public_id,
                url:mycloud.secure_url
            }
        })
        course.numOfVideos=course.lectures.length;
        await course.save();
        let lectures=course.lectures;
        res.status(200).json({
            success:true,
            "message":"lecture added successfully",
            lectures
        })
    }
)
export const deleteLecture=catchAsyncEroor(async(req,res,next)=>{
    const courseId=req.query.courseId;
    const lectureId=req.query.lectureId;
    const course=await Course.findById(courseId);
    if(!course){
        return next(new ErrorHandler("course not found"),400);
    }
    let lecture=course.lectures.find((lecture)=>{
        if(lecture._id.toString() === lectureId.toString()){
            return lecture;
        }
    })
    await cloudinary.v2.uploader.destroy(lecture.video.public_id,{
        resource_type:"video"
    })
    course.lectures=course.lectures.filter((lecture)=>{
        if(lecture._id.toString() !== lectureId.toString()){
            return lecture;
        }
    })
    await course.save();
    let newList=course.lectures;
    res.status(200).json({
        success:true,
        "lectures":newList,
        "message":"Lecture deleted successfully"

    })
})
Course.watch().on("change",async()=>{
    const stats=await State.find().sort({createdAt:-1}).limit(1);
    const courses=await Course.find({});
    console.log("************");
    console.log(stats);
    console.log(courses);
    console.log("************");
    let totalViews=0;
    for(let i=0;i<courses.length;i++){
        totalViews+=courses[i].views;
    }
    stats[0].views=totalViews;
    stats[0].createdAt=new Date(Date.now())
    await stats[0].save();
    console.log("#####");
    console.log(stats[0]);
    console.log("#####")
})