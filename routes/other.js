import express from "express"
import { contact, courseRequest } from "../controllers/otherControllers.js";
import { authorizeAdmin, isAuthenticated} from "../middleware/Auth.js";
import { getDashboard } from "../controllers/otherControllers.js";
const router=express.Router();

router.route("/contact").post(contact);
router.route("/courserequest").post(courseRequest);
router.route("/admin/stats").get(isAuthenticated,authorizeAdmin,getDashboard)
export default router;