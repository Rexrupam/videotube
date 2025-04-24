import {Router} from "express"
import {verifyJwt} from "../middlewares/auth.middleware.js"
import { addcomment } from "../controllers/comment.controller.js";

const router = Router();
router.post('/addComment/:videoId', addcomment)
export default router;