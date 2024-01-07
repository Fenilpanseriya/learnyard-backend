import express from "express";
import { addCourselactures, deleteLecture, getAllCourse, getAllCourselactures } from "../controllers/courseController.js"
import { createCourse } from "../controllers/courseController.js";
import singleUpload from "../middleware/Multer.js";
import { authorizeAdmin, authorizedSubscriber, isAuthenticated } from "../middleware/Auth.js";
const router=express.Router();

router.route("/courses").get(getAllCourse);
router.route("/createcourses").post(singleUpload,createCourse);
router.route("/course/:id").get( isAuthenticated,authorizedSubscriber,getAllCourselactures).post(isAuthenticated,singleUpload,addCourselactures);
router.route("/lecture").get(isAuthenticated,authorizeAdmin,deleteLecture);
export default router;