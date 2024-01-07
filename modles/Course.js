import mongoose, { trusted } from "mongoose";

const schema=mongoose.Schema({
    title:{
        type:String,
        required:[true,"Please enter title"],
        minLength:[4,"title is of atleast 4 character"],
        maxLength:[20,"title not exceed  20 character"]
    },
    lectures:[
        {
            title:{
                type:String,
                required:true,

            },
            description:{
                type:String,
                required:true,

            },
            video:{
                public_id:{
                    type:String,
                    required:true
                },
                url:{
                    type:String,
                    required:true
                }
        
            },

        }
    ],
    poster:{
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }

    },
    views:{
        type:Number,
        default:0
    },
    numOfVideos:{
        type:Number,
        default:0
    },
    category:{
        type:String,
        required:true
    },
    createdBy:{
        type:String,
        required:[true,"Enter course owner name"]
    },
    createdAt:{
        type:Date,
        default:Date.now()
    }
})
const Course=mongoose.model("Course",schema);
export default Course;