import express from "express"
import { isAuthenticated } from "../middleware/Auth.js";
import { buyScubscription, cancleSubscription, paymentVerify, razorpayKey } from "../controllers/paymentController.js";

const router=express.Router();

router.route("/subscribe").get(isAuthenticated,buyScubscription)
router.route("/paymentvarification").post(isAuthenticated,paymentVerify)
router.route("/getKey").get(isAuthenticated,razorpayKey);
router.route("/subscribe/cancle").get(isAuthenticated,cancleSubscription);
export default router;