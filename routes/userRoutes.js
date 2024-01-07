import express from "express";
import { changePassword, changeProfile, getAllUsers, getMyProfile, loginUser, logoutUser,changeProfilePicture, forgetPassword, resetPassword, addToPlaylist, removeFromPlaylist, updateUserRole, deleteUser, deleteMyProfile } from "../controllers/userController.js";
import { registerUser } from "../controllers/userController.js";
import { isAuthenticated,authorizeAdmin } from "../middleware/Auth.js";
import singleUpload from "../middleware/Multer.js";
const router=express.Router();

router.route("/register").post(singleUpload ,registerUser);
router.route("/login").post(loginUser);
router.route("/logoutuser").get(logoutUser);
router.route("/me").get(isAuthenticated,getMyProfile);
router.route("/me").delete(isAuthenticated,authorizeAdmin,deleteMyProfile);
router.route("/changePassword").put(isAuthenticated,changePassword);
router.route("/updateProfile").put(isAuthenticated,singleUpload,changeProfile);
router.route("/updateProfilePicture").put(isAuthenticated,singleUpload,changeProfilePicture);
router.route("/forgetPassword").post(forgetPassword);
router.route("/resetPassword/:token").put(resetPassword);

router.route("/removefromplaylist").post(isAuthenticated,removeFromPlaylist);
router.route("/admin/users").get(isAuthenticated,authorizeAdmin,getAllUsers);
router.route("/admin/user/:id/:token").put(isAuthenticated,authorizeAdmin,updateUserRole);
router.route("/admin/user/:id").delete(isAuthenticated,authorizeAdmin,deleteUser);
router.route("/playlist").post(isAuthenticated,addToPlaylist);
export default router;