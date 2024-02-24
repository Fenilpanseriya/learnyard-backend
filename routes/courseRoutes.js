import express from "express";
import { addAssignment, addCourselactures, deleteLecture, getAllCourse, getAllCourselactures } from "../controllers/courseController.js"
import { createCourse } from "../controllers/courseController.js";
import singleUpload from "../middleware/Multer.js";
import { authorizeAdmin, authorizedSubscriber, isAuthenticated } from "../middleware/Auth.js";
const router=express.Router();

router.route("/courses").get(getAllCourse);
router.route("/addAssignment").post(isAuthenticated,addAssignment)
router.route("/createcourses").post(singleUpload,createCourse);
router.route("/course/:id").get( isAuthenticated,getAllCourselactures).post(isAuthenticated,singleUpload,addCourselactures);
router.route("/lecture").get(isAuthenticated,authorizeAdmin,deleteLecture);
export default router;